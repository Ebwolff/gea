-- Schema inicial do Gea (gestão rural)
-- Mapeia as entidades que hoje vivem apenas no localStorage do navegador
-- para tabelas reais no Postgres do Supabase.
--
-- Uso single-tenant, sem Supabase Auth por enquanto: RLS fica habilitado
-- em todas as tabelas, mas com uma policy permissiva para o papel "anon"
-- (o app usa a anon key direto do cliente). Isso é aceitável para uma
-- ferramenta interna de uma única fazenda, mas ANTES de expor o app
-- publicamente ou multiplicar para outros clientes, essas policies
-- precisam ser trocadas por regras reais baseadas em auth.uid().

create extension if not exists pgcrypto;

-- ============================================================
-- PROPRIEDADES (fazendas)
-- ============================================================
create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  municipio text not null,
  estado text not null,
  area_total numeric not null default 0,
  area_propria numeric not null default 0,
  area_arrendada numeric not null default 0,
  latitude double precision,
  longitude double precision,
  tipo_solo text,
  altitude numeric,
  responsavel text,
  culturas text[] not null default '{}',
  status text not null default 'Ativa',
  created_at timestamptz not null default now()
);

-- ============================================================
-- DIAGNÓSTICO ESTRATÉGICO
-- ============================================================
create table diagnosis_questions (
  id integer primary key generated always as identity,
  area text not null,
  question text not null,
  score smallint not null default 0 check (score between 0 and 4)
);

-- ============================================================
-- FINANCEIRO
-- ============================================================
create table financial_transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  type text not null check (type in ('receita','despesa')),
  category text not null,
  cost_center text not null,
  farm_id uuid references properties(id) on delete set null,
  value numeric not null,
  account text not null,
  status text not null check (status in ('pago','pendente')),
  created_at timestamptz not null default now()
);

create index financial_transactions_farm_id_idx on financial_transactions(farm_id);
create index financial_transactions_type_idx on financial_transactions(type);

-- ============================================================
-- PATRIMÔNIO / ATIVOS
-- ============================================================
create table assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Terras','Máquinas','Implementos','Veículos','Equipamentos','Benfeitorias','Animais')),
  acquisition_date date not null,
  initial_value numeric not null,
  depreciation_rate numeric not null default 0,
  useful_life_years integer not null default 10,
  current_value numeric not null,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

-- ============================================================
-- TALHÕES / PRODUÇÃO
-- ============================================================
create table crop_fields (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area numeric not null,
  soil_type text,
  culture text not null,
  crop_year text not null,
  expected_yield numeric,
  actual_yield numeric,
  production_cost_ha numeric,
  revenue_ha numeric,
  status text not null default 'Plantado',
  created_at timestamptz not null default now()
);

-- ============================================================
-- MÁQUINAS E FROTA
-- ============================================================
create table machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  hours_worked numeric not null default 0,
  fuel_consumed numeric not null default 0,
  maintenance_cost numeric not null default 0,
  availability numeric not null default 100,
  cost_per_hour numeric not null default 0,
  status text not null default 'Disponível',
  created_at timestamptz not null default now()
);

-- ============================================================
-- ESTOQUE DE INSUMOS
-- ============================================================
create table stock_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  quantity numeric not null default 0,
  unit text not null,
  min_quantity numeric not null default 0,
  expiry_date date,
  location text,
  value numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMPRAS E PEDIDOS
-- ============================================================
create table purchase_requests (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  quantity numeric not null,
  unit text not null,
  supplier text not null,
  value numeric not null,
  requester text not null,
  date date not null default current_date,
  status text not null default 'rascunho' check (status in ('rascunho','cotacao','aprovacao','aprovado','rejeitado','concluido')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCIONÁRIOS
-- ============================================================
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  dept text not null,
  training text,
  performance text,
  status text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLANO DE AÇÃO
-- ============================================================
create table action_plan_items (
  id uuid primary key default gen_random_uuid(),
  question_id integer references diagnosis_questions(id) on delete set null,
  problem text not null,
  cause text,
  impact text,
  priority text not null check (priority in ('baixa','media','alta')),
  owner text,
  deadline date,
  status text not null default 'nao_iniciado' check (status in ('nao_iniciado','em_andamento','concluido','atrasado')),
  comments text,
  created_at timestamptz not null default now()
);

create index action_plan_items_question_id_idx on action_plan_items(question_id);

-- ============================================================
-- CHAT DO ASSISTENTE DE IA
-- ============================================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('user','assistant')),
  content text not null,
  charts jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-tenant sem Auth: libera tudo para o papel anon.
-- Revisar/restringir antes de qualquer uso multi-cliente.
-- ============================================================
alter table properties enable row level security;
alter table diagnosis_questions enable row level security;
alter table financial_transactions enable row level security;
alter table assets enable row level security;
alter table crop_fields enable row level security;
alter table machines enable row level security;
alter table stock_items enable row level security;
alter table purchase_requests enable row level security;
alter table employees enable row level security;
alter table action_plan_items enable row level security;
alter table chat_messages enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'properties','diagnosis_questions','financial_transactions','assets',
    'crop_fields','machines','stock_items','purchase_requests',
    'employees','action_plan_items','chat_messages'
  ]
  loop
    execute format('create policy "allow_all_anon" on %I for all to anon using (true) with check (true);', t);
  end loop;
end $$;
