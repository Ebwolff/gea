-- Fornecedores, Clientes, Implementos e Documentos
--
-- Essas 4 telas do app eram só mockup visual (tabelas com 2 linhas fixas no
-- código, sem tabela no banco). Esta migration cria as tabelas reais e libera
-- RLS para qualquer usuário autenticado, no mesmo padrão das demais tabelas
-- de negócio (ver 20260726180000_auth_and_profiles.sql).

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  city text,
  category text,
  avg_payment_days integer,
  rating text,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pickup_location text,
  contracted_volume numeric,
  volume_unit text,
  avg_price numeric,
  price_unit text,
  contract_status text,
  created_at timestamptz not null default now()
);

create table implements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  working_width text,
  last_lubrication_date date,
  status text not null default 'Disponível',
  created_at timestamptz not null default now()
);

-- Sem upload de arquivo real (exigiria Supabase Storage); "notes" guarda
-- informação livre como "PDF 4.2 MB" só para referência visual, como no mockup original.
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'Regularizado',
  expiry_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table suppliers enable row level security;
alter table clients enable row level security;
alter table implements enable row level security;
alter table documents enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['suppliers', 'clients', 'implements', 'documents']
  loop
    execute format('create policy "allow_all_authenticated" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- Dados de exemplo (equivalentes ao mockup original)
insert into suppliers (name, cnpj, city, category, avg_payment_days, rating) values
  ('AgroComercial Sorriso Ltda', '12.345.678/0001-90', 'Sorriso-MT', 'Defensivos e Sementes', 60, 'A (Excelente)'),
  ('Adubos e Fertilizantes Planalto S/A', '98.765.432/0002-11', 'Rondonópolis-MT', 'Nutrição Vegetal / NPK', 90, 'A (Excelente)');

insert into clients (name, pickup_location, contracted_volume, volume_unit, avg_price, price_unit, contract_status) values
  ('Cargill Alimentos S/A', 'Terminal Rondonópolis (FOB)', 25000, 'Sacas (Soja)', 135.00, '/ Saca', 'Em entrega'),
  ('Bunge Alimentos', 'Silo Próprio (EXW)', 15000, 'Sacas (Milho)', 54.50, '/ Saca', 'Fixado');

insert into implements (name, brand, working_width, last_lubrication_date, status) values
  ('Grade Niveladora 48 Discos', 'Baldan', '5.4 m', '2026-07-10', 'Disponível'),
  ('Distribuidor de Adubo e Calcário Hércules 10000', 'Stara', '12.0 m', '2026-07-05', 'Disponível');

insert into documents (title, status, expiry_date, notes) values
  ('Matrícula de Terra Nua Lote 22A', 'Regularizado', null, 'PDF 4.2 MB'),
  ('Apólice de Seguro Agrícola Porto', 'Regularizado', '2027-01-31', 'PDF 2.8 MB');
