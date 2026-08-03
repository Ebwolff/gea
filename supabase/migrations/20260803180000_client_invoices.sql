-- Notas fiscais emitidas para clientes: arquivo real (PDF/XML) armazenado no
-- Supabase Storage, para permitir o download posterior.

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

drop policy if exists "invoices_bucket_select" on storage.objects;
drop policy if exists "invoices_bucket_insert" on storage.objects;
drop policy if exists "invoices_bucket_update" on storage.objects;
drop policy if exists "invoices_bucket_delete" on storage.objects;

create policy "invoices_bucket_select" on storage.objects for select to authenticated using (bucket_id = 'invoices');
create policy "invoices_bucket_insert" on storage.objects for insert to authenticated with check (bucket_id = 'invoices');
create policy "invoices_bucket_update" on storage.objects for update to authenticated using (bucket_id = 'invoices');
create policy "invoices_bucket_delete" on storage.objects for delete to authenticated using (bucket_id = 'invoices');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  number text,
  issue_date date,
  value numeric,
  file_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
create policy "allow_all_authenticated" on invoices for all to authenticated using (true) with check (true);
