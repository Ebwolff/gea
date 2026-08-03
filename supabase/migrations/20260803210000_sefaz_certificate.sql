-- Armazenamento do certificado digital usado nas consultas à SEFAZ.
--
-- Segurança: RLS fica ativo SEM NENHUMA policy para "authenticated"/"anon" —
-- ou seja, nenhum usuário logado (nem admin) consegue ler ou escrever aqui
-- via API. Só o service role (usado internamente pelas Edge Functions
-- sefaz-save-certificate e sefaz-sync-invoices) tem acesso, porque o service
-- role sempre ignora RLS. A senha do certificado nunca é gravada — só o
-- certificado e a chave privada já convertidos para PEM.
create table if not exists sefaz_certificate (
  id boolean primary key default true,
  cert_pem text,
  key_pem text,
  doc_type text,   -- 'cpf' ou 'cnpj'
  doc_number text, -- só dígitos
  uf_code text,
  ambiente text not null default '1',
  uploaded_at timestamptz,
  constraint sefaz_certificate_singleton check (id)
);
insert into sefaz_certificate (id) values (true) on conflict (id) do nothing;

alter table sefaz_certificate enable row level security;
-- Nenhuma policy é criada de propósito.

-- Função "security definer" para o front-end conseguir mostrar o status do
-- certificado (sem nunca expor cert_pem/key_pem) mesmo com a tabela travada.
create or replace function public.sefaz_certificate_status()
returns table (
  configured boolean,
  doc_type text,
  doc_number_masked text,
  uf_code text,
  ambiente text,
  uploaded_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    (cert_pem is not null and key_pem is not null) as configured,
    doc_type,
    case when doc_number is not null and length(doc_number) > 2
      then repeat('*', length(doc_number) - 2) || right(doc_number, 2)
      else doc_number
    end as doc_number_masked,
    uf_code,
    ambiente,
    uploaded_at
  from sefaz_certificate
  where id = true;
$$;

grant execute on function public.sefaz_certificate_status() to authenticated;
