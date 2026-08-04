-- A tela de Planejamento Estratégico tinha 3 cards de "Objetivos
-- Estratégicos (OKR)" com texto fixo no código (mockup, sem tabela).
-- Esta migration cria a tabela real, sem nenhum dado de exemplo — a lista
-- começa vazia e o usuário cadastra os objetivos reais da fazenda.
create table strategic_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  target_date date,
  progress text not null default 'Planejado',
  created_at timestamptz not null default now()
);

alter table strategic_goals enable row level security;
create policy "allow_all_authenticated" on strategic_goals for all to authenticated using (true) with check (true);
