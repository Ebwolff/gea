import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, GraduationCap, Trophy, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '../Toast';

export const EmployeesModule: React.FC = () => {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useApp();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('');
  const [training, setTraining] = useState('');
  const [performance, setPerformance] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const resetForm = () => { setName(''); setRole(''); setDept(''); setTraining(''); setPerformance(''); setStatus('Ativo'); setEditingUuid(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !dept) return;
    const data = { name, role, dept, training: training ? `${training}h` : '0h', performance: performance ? `${performance}%` : '100%', status };
    if (editingUuid) { updateEmployee(editingUuid, data); showToast('Colaborador atualizado!'); }
    else { addEmployee(data); showToast('Novo colaborador cadastrado!'); }
    resetForm(); setShowAddForm(false);
  };

  const handleEdit = (e: typeof employees[0]) => {
    setEditingUuid(e.uuid); setName(e.name); setRole(e.role); setDept(e.dept);
    setTraining(e.training.replace('h', '')); setPerformance(e.performance.replace('%', '')); setStatus(e.status);
    setShowAddForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}"?`)) { removeEmployee(uuid); showToast('Colaborador excluído.', 'error'); }
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase()) || e.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">Gestão de Pessoas e Organograma</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitore o quadro funcional da fazenda, treinamentos técnicos (NRs) e avaliações de desempenho.</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto">
          {showAddForm ? 'Fechar Formulário' : 'Novo Colaborador'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João da Silva" className={inputClass} /></div>
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Função / Cargo</label><input type="text" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="Operador de Trator" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Departamento</label><input type="text" required value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Campo" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Situação</label><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Treinamento (h)</label><input type="number" value={training} onChange={(e) => setTraining(e.target.value)} placeholder="30" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Metas (%)</label><input type="number" value={performance} onChange={(e) => setPerformance(e.target.value)} placeholder="100" className={inputClass} /></div>
          <div className="flex items-end md:col-span-4"><button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">{editingUuid ? 'Atualizar' : 'Salvar Colaborador'}</button></div>
        </form>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><Users size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Total no Quadro</span><span className="text-base font-bold text-slate-800 dark:text-white">{employees.filter(e => e.status === 'Ativo').length} Ativos</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500"><GraduationCap size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Horas de Treinamento (Acum.)</span><span className="text-base font-bold text-slate-800 dark:text-white">{employees.reduce((sum, e) => sum + parseInt(e.training || '0'), 0)}h</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500"><Trophy size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Ating. Médio de Metas</span><span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + parseInt(e.performance || '0'), 0) / employees.length) : 0}%</span></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">Quadro Funcional e Desempenho</h3>
          <div className="relative w-64"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar colaborador..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Nome</th><th className="py-3 px-4">Função / Cargo</th><th className="py-3 px-4">Departamento</th><th className="py-3 px-4 text-center">Treinamento</th><th className="py-3 px-4 text-center">Metas</th><th className="py-3 px-4 text-center">Situação</th><th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredEmployees.map(person => (
                <tr key={person.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{person.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{person.role}</td>
                  <td className="py-3.5 px-4 text-slate-500">{person.dept}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">{person.training}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-brand-600 dark:text-brand-400">{person.performance}</td>
                  <td className="py-3.5 px-4 text-center"><span className={`inline-flex px-2 py-0.5 rounded text-4xs font-bold uppercase ${person.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200/50 text-slate-500'}`}>{person.status}</span></td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(person)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(person.uuid, person.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
