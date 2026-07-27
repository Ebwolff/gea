-- Autenticação e controle de acesso por papel (role)
--
-- Introduz a tabela `profiles` (1:1 com auth.users), um papel por usuário,
-- e troca as policies de RLS de "anon" (aberto) para "authenticated"
-- (exige login válido) em todas as tabelas de negócio.
--
-- Importante: essa migration restringe QUEM pode ler/escrever (precisa estar
-- logado), mas não diferencia ainda O QUE cada papel pode ler/escrever no
-- banco — isso é feito hoje só na interface (menu lateral filtrado por papel).
-- Qualquer usuário autenticado continua podendo ler/gravar em todas as
-- tabelas de negócio. Refinar isso por papel exigiria políticas RLS
-- específicas por tabela, o que fica como evolução futura se necessário.

-- ============================================================
-- PROFILES
-- ============================================================
-- Remove uma tabela "profiles" de um projeto antigo que reaproveitou este
-- mesmo servidor Supabase (colunas nome/email/permissions, sem relação com
-- o Gea) — confirmado com o usuário que esses dados podem ser descartados.
drop table if exists public.profiles cascade;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'consultor' check (role in (
    'admin', 'consultor', 'produtor_rural', 'gestor_financeiro',
    'gerente_fazenda', 'funcionario', 'contador'
  )),
  created_at timestamptz not null default now()
);

-- Função auxiliar (security definer para não recursar nas próprias policies
-- de `profiles` ao checar o papel do usuário logado).
-- Nomes de função/trigger padrão do Supabase: dropar antes por segurança,
-- caso o projeto antigo reaproveitado já tivesse algo com o mesmo nome.
drop function if exists is_admin() cascade;

create function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Cria automaticamente a linha em `profiles` quando um usuário é criado no
-- Supabase Auth (pela Edge Function create-user, usando a service role).
drop function if exists handle_new_user() cascade;

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'consultor')
  );
  return new;
end;
$$;

-- Mesmo motivo do "drop table profiles" acima: um projeto antigo neste
-- servidor já usava esse nome de trigger padrão do Supabase.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;

create policy "profiles_select_own_or_admin" on profiles
  for select to authenticated
  using (id = auth.uid() or is_admin());

create policy "profiles_update_admin" on profiles
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "profiles_delete_admin" on profiles
  for delete to authenticated
  using (is_admin());

-- Sem policy de insert: a criação de profile acontece só via trigger
-- (a partir da criação do usuário pela Edge Function com service role,
-- que ignora RLS). Nenhum client autenticado precisa inserir aqui.

-- ============================================================
-- Troca as tabelas de negócio de "anon" (aberto) para "authenticated"
-- ============================================================
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
    execute format('drop policy if exists "allow_all_anon" on %I;', t);
    execute format('create policy "allow_all_authenticated" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
