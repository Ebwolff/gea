import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import { ROLE_LABELS } from '../../lib/roles';
import { User, Shield, KeyRound } from 'lucide-react';

const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

const SefazCertificateCard: React.FC = () => {
  const { sefazCertStatus, refreshSefazCertStatus, uploadSefazCertificate } = useApp();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>('cpf');
  const [docNumber, setDocNumber] = useState('');
  const [ufCode, setUfCode] = useState('21');
  const [ambiente, setAmbiente] = useState<'1' | '2'>('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => { refreshSefazCertStatus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password || !docNumber || !ufCode) return;
    setSaving(true);
    try {
      const result = await uploadSefazCertificate({ file, password, docType, docNumber, ufCode, ambiente });
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Certificado configurado com sucesso!');
        setFile(null); setPassword('');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4 md:col-span-3">
      <h3 className="text-xs font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
        <KeyRound size={14} className="text-brand-600" />
        Certificado Digital (SEFAZ) — Sincronização de Notas Fiscais
      </h3>
      <p className="text-3xs text-slate-500">
        Envie o certificado A1 (.pfx/.p12) usado para buscar as notas fiscais direto na SEFAZ. O arquivo é convertido e a senha nunca fica salva — só o certificado convertido, guardado numa tabela que nenhum usuário consegue ler pela API, só o sistema internamente.
      </p>

      <div className="text-3xs">
        {sefazCertStatus?.configured ? (
          <p className="text-emerald-600 font-bold">
            ✓ Configurado — {sefazCertStatus.docType?.toUpperCase()} {sefazCertStatus.docNumberMasked} • UF {sefazCertStatus.ufCode} • {sefazCertStatus.ambiente === '2' ? 'Homologação' : 'Produção'}
            {sefazCertStatus.uploadedAt ? ` • enviado em ${new Date(sefazCertStatus.uploadedAt).toLocaleString('pt-BR')}` : ''}
          </p>
        ) : (
          <p className="text-slate-400">Nenhum certificado configurado ainda.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Arquivo do certificado (.pfx/.p12)</label>
          <input type="file" required accept=".pfx,.p12" onChange={e => setFile(e.target.files?.[0] ?? null)} className={inputClass + ' py-1'} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Senha do certificado</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo</label>
          <select value={docType} onChange={e => setDocType(e.target.value as 'cpf' | 'cnpj')} className={inputClass}>
            <option value="cpf">CPF (Produtor Rural)</option>
            <option value="cnpj">CNPJ</option>
          </select>
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">{docType === 'cpf' ? 'CPF' : 'CNPJ'}</label>
          <input required value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0001-00'} className={inputClass} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">UF</label>
          <select value={ufCode} onChange={e => setUfCode(e.target.value)} className={inputClass}>
            <option value="21">Maranhão (MA)</option>
            <option value="51">Mato Grosso (MT)</option>
            <option value="11">Rondônia (RO)</option>
            <option value="17">Tocantins (TO)</option>
            <option value="22">Piauí (PI)</option>
          </select>
        </div>
        <div className="md:col-span-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Ambiente</label>
            <select value={ambiente} onChange={e => setAmbiente(e.target.value as '1' | '2')} className={inputClass}>
              <option value="1">Produção</option>
              <option value="2">Homologação</option>
            </select>
          </div>
          <button type="submit" disabled={saving || !file} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold whitespace-nowrap">
            {saving ? 'Enviando...' : 'Salvar Certificado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const SettingsModule: React.FC = () => {
  const { profile } = useAuth();
  const { farms } = useApp();
  const roleLabel = profile ? ROLE_LABELS[profile.role] : '';

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Configurações do Sistema
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ajuste preferências de notificação, segurança, parâmetros fiscais e permissões de usuários.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <User size={14} className="text-brand-600" />
            Dados da Conta e Perfil Ativo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-3xs text-slate-400 font-bold block mb-1">Nome Completo:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{profile?.fullName ?? '-'}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block mb-1">E-mail:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{profile?.email ?? '-'}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block mb-1">Perfil Corporativo:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{roleLabel}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block mb-1">Propriedade(s) Cadastrada(s):</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{farms.length > 0 ? farms.map(f => f.name).join(', ') : 'Nenhuma propriedade cadastrada'}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <Shield size={14} className="text-brand-600" />
            Políticas de Acesso
          </h3>
          <div className="text-3xs text-slate-400 space-y-2.5">
            <p>O perfil **{roleLabel}** possui privilégios de edição na maioria dos módulos operacionais, incluindo diagnósticos e planos de ação.</p>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 font-semibold">
              <span>Autenticação:</span>
              <span className="text-emerald-500">Supabase Auth</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Row Level Security:</span>
              <span className="text-emerald-500">Ativo (só usuários autenticados)</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Criptografia de Banco:</span>
              <span className="text-emerald-500">AES-256 (em repouso, Supabase/Postgres)</span>
            </div>
          </div>
        </div>

        {profile?.role === 'admin' && <SefazCertificateCard />}
      </div>
    </div>
  );
};
