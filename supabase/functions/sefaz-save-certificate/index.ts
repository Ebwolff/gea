// Edge Function: sefaz-save-certificate
//
// Recebe o certificado digital (.pfx/.p12) em base64 + a senha, converte
// para PEM (certificado + chave privada) e grava só o resultado na tabela
// `sefaz_certificate` — que não tem NENHUMA policy de RLS para usuários
// logados, só o service role (usado aqui dentro) consegue gravar/ler.
// A senha do certificado nunca é persistida em lugar nenhum, só é usada em
// memória durante esta chamada para abrir o arquivo.
//
// Só admins podem chamar (mesma checagem usada em create-user).
//
// Deploy: Dashboard > Edge Functions > Deploy a new function > Via Editor,
// nome exato "sefaz-save-certificate".

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import forge from 'https://esm.sh/node-forge@1.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) return json({ error: 'Sessão inválida.' }, 401);

    const { data: callerProfile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Apenas administradores podem configurar o certificado.' }, 403);
    }

    const body = await req.json();
    const { pfxBase64, password, docType, docNumber, ufCode, ambiente } = body ?? {};

    if (!pfxBase64 || !password || !docType || !docNumber || !ufCode) {
      return json({ error: 'Preencha o arquivo, a senha, o CPF/CNPJ e a UF.' }, 400);
    }
    if (docType !== 'cpf' && docType !== 'cnpj') {
      return json({ error: 'Tipo de documento inválido.' }, 400);
    }

    let certPem: string;
    let keyPem: string;
    try {
      const der = forge.util.decode64(pfxBase64);
      const asn1 = forge.asn1.fromDer(der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);

      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
      const keyBags =
        p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ??
        p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag];

      if (!certBags?.length || !keyBags?.length) {
        throw new Error('Certificado ou chave privada não encontrados dentro do arquivo.');
      }

      certPem = forge.pki.certificateToPem(certBags[0].cert);
      keyPem = forge.pki.privateKeyToPem(keyBags[0].key);
    } catch (e) {
      // Nunca loga a senha nem o conteúdo do arquivo — só a mensagem de erro do forge.
      console.error('Falha ao processar o certificado:', e instanceof Error ? e.message : String(e));
      return json({ error: 'Não foi possível abrir o certificado. Verifique se a senha está correta e se o arquivo é um .pfx/.p12 válido.' }, 400);
    }

    const db = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await db.from('sefaz_certificate').update({
      cert_pem: certPem,
      key_pem: keyPem,
      doc_type: docType,
      doc_number: String(docNumber).replace(/\D/g, ''),
      uf_code: String(ufCode),
      ambiente: ambiente === '2' ? '2' : '1',
      uploaded_at: new Date().toISOString(),
    }).eq('id', true);

    if (error) {
      console.error('Erro ao salvar certificado no banco:', error);
      return json({ error: 'Falha ao salvar o certificado no banco.' }, 500);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('sefaz-save-certificate error:', err);
    return json({ error: 'Erro interno ao processar o certificado.' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
