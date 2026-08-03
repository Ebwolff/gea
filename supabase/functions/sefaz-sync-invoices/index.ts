// Edge Function: sefaz-sync-invoices
//
// Sincroniza notas fiscais eletrônicas (NF-e) direto da SEFAZ (Ambiente
// Nacional, webservice "NFeDistribuicaoDFe") e grava as que conseguir
// baixar por completo na tabela `invoices` (arquivo real no Storage,
// bucket "invoices"), vinculando ao cliente pelo CNPJ do destinatário.
//
// ATENÇÃO — risco conhecido: esta função depende de `Deno.createHttpClient`
// com certificado cliente (mTLS), exigido pela SEFAZ. Não há garantia de que
// o runtime de Edge Functions do Supabase permita isso; é o primeiro ponto a
// validar rodando esta função uma vez e olhando o log de erro, se houver.
//
// Requer os seguintes secrets configurados em
// Dashboard > Edge Functions > sefaz-sync-invoices > Secrets (nunca no código):
//   SEFAZ_CERT_PEM   — certificado do certificado digital, em PEM
//   SEFAZ_KEY_PEM    — chave privada correspondente, em PEM (sem senha)
//   SEFAZ_CPF        — CPF do produtor rural (só dígitos) — OU SEFAZ_CNPJ
//   SEFAZ_UF_CODE    — código IBGE da UF do certificado (ex: 21 = MA)
//   SEFAZ_AMBIENTE   — "1" produção (padrão) ou "2" homologação
//
// Deploy: Dashboard > Edge Functions > Deploy a new function > Via Editor,
// nome exato "sefaz-sync-invoices", colar este arquivo.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const AN_ENDPOINT = {
  '1': 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  '2': 'https://hom.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
} as const;

const MAX_BATCHES_PER_RUN = 15; // cada lote traz até 50 docs; evita estourar o tempo da function
const MAX_MS_PER_RUN = 50_000;

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

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

    const certPem = Deno.env.get('SEFAZ_CERT_PEM');
    const keyPem = Deno.env.get('SEFAZ_KEY_PEM');
    const cpf = Deno.env.get('SEFAZ_CPF');
    const cnpj = Deno.env.get('SEFAZ_CNPJ');
    const ufCode = Deno.env.get('SEFAZ_UF_CODE');
    const ambiente = (Deno.env.get('SEFAZ_AMBIENTE') ?? '1') as '1' | '2';

    if (!certPem || !keyPem) return json({ error: 'SEFAZ_CERT_PEM / SEFAZ_KEY_PEM não configurados.' }, 500);
    if (!cpf && !cnpj) return json({ error: 'Configure SEFAZ_CPF ou SEFAZ_CNPJ.' }, 500);
    if (!ufCode) return json({ error: 'SEFAZ_UF_CODE não configurado.' }, 500);

    let httpClient: Deno.HttpClient;
    try {
      httpClient = Deno.createHttpClient({ cert: certPem, key: keyPem });
    } catch (e) {
      console.error('Falha ao criar cliente mTLS:', e);
      return json({ error: 'Este ambiente não suporta certificado cliente (mTLS) via Deno.createHttpClient. Falha: ' + String(e) }, 500);
    }

    const db = createClient(supabaseUrl, serviceRoleKey);

    const { data: stateRow } = await db.from('sefaz_sync_state').select('*').eq('id', true).single();
    let ultNSU = stateRow?.ult_nsu ?? '000000000000000';

    const { data: clients } = await db.from('clients').select('id, cnpj');
    const clientByCnpj = new Map<string, string>();
    for (const c of clients ?? []) {
      if (c.cnpj) clientByCnpj.set(onlyDigits(c.cnpj), c.id);
    }

    const startedAt = Date.now();
    let totalDocsFound = 0;
    let totalInvoicesCreated = 0;
    let totalLinked = 0;
    let batches = 0;
    let lastCStat = '';
    let lastMotivo = '';
    let stopReason = 'ok';

    while (batches < MAX_BATCHES_PER_RUN && Date.now() - startedAt < MAX_MS_PER_RUN) {
      batches++;
      const soapBody = buildDistDFeIntEnvelope({ ambiente, ufCode, cpf, cnpj, ultNSU });

      const resp = await fetch(AN_ENDPOINT[ambiente], {
        method: 'POST',
        client: httpClient,
        headers: {
          'Content-Type': `application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse"`,
        },
        body: soapBody,
      } as RequestInit);

      const respText = await resp.text();
      if (!resp.ok) {
        lastMotivo = `HTTP ${resp.status} da SEFAZ: ${respText.slice(0, 500)}`;
        stopReason = 'http_error';
        break;
      }

      const parsed = xmlParser.parse(respText);
      const ret = findRetDistDFeInt(parsed);
      if (!ret) {
        lastMotivo = 'Resposta da SEFAZ em formato inesperado: ' + respText.slice(0, 500);
        stopReason = 'parse_error';
        break;
      }

      lastCStat = String(ret.cStat ?? '');
      lastMotivo = String(ret.xMotivo ?? '');

      if (lastCStat !== '137' && lastCStat !== '138') {
        // Qualquer outro cStat é erro/rejeição (ex: 656 = consumo indevido).
        stopReason = 'rejected';
        break;
      }

      const newUltNSU = String(ret.ultNSU ?? ultNSU);
      const maxNSU = String(ret.maxNSU ?? newUltNSU);

      const docZips = extractDocZips(ret?.loteDistDFeInt?.docZip);
      for (const doc of docZips) {
        totalDocsFound++;
        const xml = await gunzipBase64(doc.value);
        const result = await processDocXml(db, xml, clientByCnpj);
        if (result === 'created') totalInvoicesCreated++;
        if (result === 'linked') { totalInvoicesCreated++; totalLinked++; }
      }

      ultNSU = newUltNSU;
      await db.from('sefaz_sync_state').update({
        ult_nsu: ultNSU,
        last_sync_at: new Date().toISOString(),
        last_status: lastCStat,
        last_message: lastMotivo,
      }).eq('id', true);

      if (lastCStat === '137' || newUltNSU === maxNSU) {
        stopReason = 'caught_up';
        break;
      }
    }

    await db.from('sefaz_sync_state').update({
      last_sync_at: new Date().toISOString(),
      last_status: lastCStat || stopReason,
      last_message: lastMotivo || stopReason,
    }).eq('id', true);

    return json({
      stopReason, batches, totalDocsFound, totalInvoicesCreated, totalLinked, lastCStat, lastMotivo,
    }, 200);
  } catch (err) {
    console.error('sefaz-sync-invoices error:', err);
    return json({ error: 'Erro interno: ' + String(err) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function onlyDigits(s: string): string {
  return (s || '').replace(/\D/g, '');
}

function buildDistDFeIntEnvelope(opts: { ambiente: '1' | '2'; ufCode: string; cpf?: string; cnpj?: string; ultNSU: string }): string {
  const doc = opts.cnpj
    ? `<CNPJ>${onlyDigits(opts.cnpj)}</CNPJ>`
    : `<CPF>${onlyDigits(opts.cpf!)}</CPF>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
      <nfeDadosMsg>
        <distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">
          <tpAmb>${opts.ambiente}</tpAmb>
          <cUFAutor>${opts.ufCode}</cUFAutor>
          ${doc}
          <distNSU><ultNSU>${opts.ultNSU}</ultNSU></distNSU>
        </distDFeInt>
      </nfeDadosMsg>
    </nfeDistDFeInteresse>
  </soap12:Body>
</soap12:Envelope>`;
}

// deno-lint-ignore no-explicit-any
function findRetDistDFeInt(parsed: any): any {
  const body = parsed?.['soap:Envelope']?.['soap:Body'] ?? parsed?.['soap12:Envelope']?.['soap12:Body'];
  const respNode = body?.nfeDistDFeInteresseResponse ?? body?.['nfeDistDFeInteresseResponse'];
  return respNode?.nfeDistDFeInteresseResult?.retDistDFeInt ?? respNode?.retDistDFeInt;
}

// deno-lint-ignore no-explicit-any
function extractDocZips(node: any): Array<{ nsu: string; schema: string; value: string }> {
  if (!node) return [];
  const arr = Array.isArray(node) ? node : [node];
  return arr.map((d) => ({ nsu: d['@_NSU'], schema: d['@_schema'], value: typeof d === 'string' ? d : d['#text'] }));
}

async function gunzipBase64(b64: string): Promise<string> {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder('utf-8').decode(buf);
}

type ProcessResult = 'skipped' | 'created' | 'linked' | 'duplicate';

async function processDocXml(
  // deno-lint-ignore no-explicit-any
  db: any,
  xml: string,
  clientByCnpj: Map<string, string>,
): Promise<ProcessResult> {
  const parsed = xmlParser.parse(xml);

  // Documento completo (procNFe/nfeProc): contém tudo, inclusive o destinatário.
  const nfeProc = parsed?.nfeProc;
  if (nfeProc?.NFe?.infNFe) {
    const infNFe = nfeProc.NFe.infNFe;
    const chave = String(infNFe['@_Id'] ?? '').replace(/^NFe/, '');
    const ide = infNFe.ide ?? {};
    const emit = infNFe.emit ?? {};
    const dest = infNFe.dest ?? {};
    const vNF = infNFe.total?.ICMSTot?.vNF;
    const destDoc = onlyDigits(dest.CNPJ ?? dest.CPF ?? '');
    const clientId = clientByCnpj.get(destDoc) ?? null;

    const filePath = `sefaz/${destDoc || 'sem-destinatario'}/${chave}.xml`;
    const { error: uploadError } = await db.storage.from('invoices').upload(filePath, new Blob([xml], { type: 'application/xml' }), { upsert: true });
    if (uploadError) console.error('Erro ao subir XML da SEFAZ para o Storage:', uploadError);

    const { error } = await db.from('invoices').insert({
      client_id: clientId,
      number: ide.nNF ? String(ide.nNF) : null,
      issue_date: ide.dhEmi ? String(ide.dhEmi).slice(0, 10) : null,
      value: vNF ? Number(vNF) : null,
      file_path: uploadError ? null : filePath,
      file_name: `NFe-${chave}.xml`,
      access_key: chave,
      source: 'sefaz',
      issuer_name: emit.xNome ?? null,
      issuer_doc: onlyDigits(emit.CNPJ ?? emit.CPF ?? ''),
      dest_name: dest.xNome ?? null,
      dest_doc: destDoc || null,
    });
    if (error) {
      if (String(error.code) === '23505') return 'duplicate'; // access_key já existe
      console.error('Erro ao gravar invoice (procNFe):', error);
      return 'skipped';
    }
    return clientId ? 'linked' : 'created';
  }

  // Só o resumo (resNFe): sem o XML completo nem o destinatário disponíveis
  // ainda — grava como metadado para revisão manual depois.
  const resNFe = parsed?.resNFe;
  if (resNFe?.chNFe) {
    const chave = String(resNFe.chNFe);
    const { error } = await db.from('invoices').insert({
      client_id: null,
      number: null,
      issue_date: resNFe.dhEmi ? String(resNFe.dhEmi).slice(0, 10) : null,
      value: resNFe.vNF ? Number(resNFe.vNF) : null,
      file_path: null,
      file_name: `NFe-${chave}-resumo.xml`,
      access_key: chave,
      source: 'sefaz-resumo',
      issuer_name: resNFe.xNome ?? null,
      issuer_doc: onlyDigits(resNFe.CNPJ ?? ''),
      dest_name: null,
      dest_doc: null,
    });
    if (error) {
      if (String(error.code) === '23505') return 'duplicate';
      console.error('Erro ao gravar invoice (resNFe):', error);
      return 'skipped';
    }
    return 'created';
  }

  // resEvento (manifestação, cancelamento etc.) ou schema desconhecido: ignora.
  return 'skipped';
}
