import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/roles';
import { User, Shield } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { profile } = useAuth();
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
              <span className="text-3xs text-slate-400 font-bold block mb-1">Empresa Agrícola:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Agropecuária Bela Vista Ltda</span>
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
              <span>Auditoria de Logs:</span>
              <span className="text-emerald-500">Ativa (100%)</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Soft Delete de Registros:</span>
              <span className="text-emerald-500">Ativa</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Criptografia de Banco:</span>
              <span className="text-emerald-500">AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
