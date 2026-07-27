// Edge Function: create-user
//
// Cria um novo usuário no Supabase Auth (com senha temporária definida pelo
// admin) e o papel (role) dele. Só pode ser chamada por um usuário já
// autenticado cujo profile tenha role = 'admin' — isso é verificado aqui
// dentro, usando o token de quem chamou, ANTES de usar a service role key
// (que tem acesso total e nunca deve ficar exposta no navegador).
//
// Deploy: cole este arquivo em Supabase Dashboard > Edge Functions >
// create-user (ou `supabase functions deploy create-user` se preferir CLI).
// As variáveis SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
// já ficam disponíveis automaticamente, não precisa configurar nada.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ALLOWED_ROLES = [
  'admin', 'consultor', 'produtor_rural', 'gestor_financeiro',
  'gerente_fazenda', 'funcionario', 'contador',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Não autenticado.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Cliente "como o chamador", só para descobrir quem é e checar o papel dele.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: 'Sessão inválida.' }, 401);
    }

    const { data: callerProfile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Apenas administradores podem criar usuários.' }, 403);
    }

    const body = await req.json();
    const { email, password, fullName, role } = body ?? {};

    if (!email || !password || !fullName || !role) {
      return json({ error: 'Preencha e-mail, senha, nome e papel.' }, 400);
    }
    if (password.length < 6) {
      return json({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, 400);
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return json({ error: 'Papel inválido.' }, 400);
    }

    // Cliente com privilégio total, só usado depois de confirmar que quem
    // chamou é admin.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createError || !created?.user) {
      return json({ error: createError?.message ?? 'Falha ao criar usuário.' }, 400);
    }

    return json({ id: created.user.id, email: created.user.email }, 201);
  } catch (err) {
    console.error('create-user error:', err);
    return json({ error: 'Erro interno ao criar usuário.' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
