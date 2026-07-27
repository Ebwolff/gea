import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth, type UserRole, type Profile } from '../../context/AuthContext';
import { ROLE_OPTIONS } from '../../lib/roles';
import { UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../Toast';

export const UserManagementModule: React.FC = () => {
  const { profile: currentProfile } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consultor');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .order('full_name');
    if (error) {
      console.error('Erro ao carregar usuários:', error);
      showToast('Não foi possível carregar a lista de usuários.', 'error');
    } else {
      setUsers((data ?? []).map(d => ({ id: d.id, email: d.email, fullName: d.full_name, role: d.role as UserRole })));
    }
    setLoadingUsers(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!fullName || !email || !password) return;

    setSubmitting(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, fullName, role },
      headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
    });
    setSubmitting(false);

    if (error || (data && 'error' in data)) {
      const message = (data as { error?: string } | null)?.error ?? error?.message ?? 'Falha ao criar usuário.';
      setFormError(message);
      return;
    }

    showToast('Usuário criado com sucesso!');
    setFullName(''); setEmail(''); setPassword(''); setRole('consultor');
    loadUsers();
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      showToast('Erro ao atualizar o papel do usuário.', 'error');
      loadUsers();
    } else {
      showToast('Papel do usuário atualizado.');
    }
  };

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display flex items-center gap-2">
            <ShieldCheck className="text-brand-600" size={22} />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crie contas de acesso e defina o papel (o que cada pessoa pode ver no menu) de cada usuário.
          </p>
        </div>
      </div>

      {/* Formulário de novo usuário */}
      <form onSubmit={handleCreate} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome completo</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome do usuário" className={inputClass} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">E-mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@email.com" className={inputClass} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Senha provisória</label>
          <input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
        </div>
        <div>
          <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Papel</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Criar Usuário
          </button>
        </div>
        {formError && (
          <div className="md:col-span-5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}
      </form>

      {/* Lista de usuários */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">Usuários Cadastrados ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4 w-56">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {loadingUsers ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-400">Carregando...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      disabled={u.id === currentProfile?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      title={u.id === currentProfile?.id ? 'Você não pode alterar o próprio papel' : undefined}
                      className={inputClass}
                    >
                      {ROLE_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-3xs text-slate-400 dark:text-slate-500">
        O papel controla apenas quais módulos aparecem no menu de cada usuário. Todo usuário autenticado
        tem acesso de leitura e escrita aos dados no banco — ainda não há restrição por papel a nível de banco de dados.
      </p>
    </div>
  );
};
