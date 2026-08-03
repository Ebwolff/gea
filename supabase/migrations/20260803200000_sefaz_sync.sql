-- Suporte à sincronização automática de notas fiscais com a SEFAZ
-- (webservice NFeDistribuicaoDFe, Ambiente Nacional).

-- CNPJ do cliente, usado para casar o destinatário de cada NF-e retornada
-- pela SEFAZ com um cliente já cadastrado.
alter table clients add column if not exists cnpj text;

-- As notas importadas automaticamente podem chegar sem um cliente
-- correspondente cadastrado ainda (o CNPJ do destinatário não bate com
-- nenhum client existente) — nesse caso ficam "não vinculadas" até alguém
-- associar manualmente.
alter table invoices alter column client_id drop not null;
alter table invoices add column if not exists access_key text unique;
alter table invoices add column if not exists source text not null default 'manual';
alter table invoices add column if not exists issuer_name text;
alter table invoices add column if not exists issuer_doc text;
alter table invoices add column if not exists dest_name text;
alter table invoices add column if not exists dest_doc text;

-- Estado da sincronização (cursor NSU exigido pelo protocolo de
-- Distribuição DFe, para buscar só o que é novo a cada execução).
create table if not exists sefaz_sync_state (
  id boolean primary key default true,
  ult_nsu text not null default '000000000000000',
  last_sync_at timestamptz,
  last_status text,
  last_message text,
  constraint sefaz_sync_state_singleton check (id)
);
insert into sefaz_sync_state (id) values (true) on conflict (id) do nothing;

alter table sefaz_sync_state enable row level security;
drop policy if exists "allow_all_authenticated" on sefaz_sync_state;
create policy "allow_all_authenticated" on sefaz_sync_state for all to authenticated using (true) with check (true);
