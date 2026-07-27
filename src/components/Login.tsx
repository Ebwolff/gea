import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-emerald-500/20">
            G
          </div>
          <h1 className="mt-3 font-bold text-2xl text-slate-800 dark:text-white font-display">Gea</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Controladoria Estratégica</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4">
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-sm py-2.5 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-sm py-2.5 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-sm font-bold transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </button>

          <p className="text-3xs text-slate-400 dark:text-slate-500 text-center pt-1">
            Acesso apenas para usuários cadastrados pelo administrador.
          </p>
        </form>
      </div>
    </div>
  );
};
