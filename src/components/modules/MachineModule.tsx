import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, Fuel, Hourglass, ShieldAlert, Pencil, Trash2, Search } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from '../Toast';

export const MachineModule: React.FC = () => {
  const { machines, addMachine, updateMachine, removeMachine } = useApp();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Trator');
  const [status, setStatus] = useState('Disponível');

  const resetForm = () => { setName(''); setType('Trator'); setStatus('Disponível'); setEditingUuid(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingUuid) {
      updateMachine(editingUuid, { name, type, status });
      showToast('Máquina atualizada com sucesso!');
    } else {
      addMachine({ name, type, status });
      showToast('Nova máquina cadastrada!');
    }
    resetForm(); setShowAddForm(false);
  };

  const handleEdit = (m: typeof machines[0]) => {
    setEditingUuid(m.uuid); setName(m.name); setType(m.type); setStatus(m.status); setShowAddForm(true);
  };

  const handleDelete = (uuid: string, n: string) => {
    if (confirm(`Excluir "${n}"?`)) { removeMachine(uuid); showToast('Máquina excluída.', 'error'); }
  };

  const totalFuel = machines.reduce((sum, m) => sum + m.fuelConsumed, 0);
  const totalMaint = machines.reduce((sum, m) => sum + m.maintenanceCost, 0);
  const avgAvailability = machines.length > 0 ? Math.round(machines.reduce((sum, m) => sum + m.availability, 0) / machines.length) : 0;

  const filteredMachines = machines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">Frota de Máquinas e Mecanização</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe o rendimento operacional, disponibilidade mecânica e o custo por hora de tratores e colheitadeiras.</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto">
          {showAddForm ? 'Fechar Formulário' : 'Nova Máquina'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome / Modelo</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Colheitadeira John Deere S770" className={inputClass} /></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Tipo</label><select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}><option value="Trator">Trator</option><option value="Colheitadeira">Colheitadeira</option><option value="Pulverizador">Pulverizador</option><option value="Semeadora">Semeadora</option><option value="Caminhão">Caminhão</option><option value="Outro">Outro</option></select></div>
          <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="Disponível">Disponível</option><option value="Em Manutenção">Em Manutenção</option><option value="Trabalhando">Trabalhando</option></select></div>
          <div className="flex items-end md:col-span-4"><button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">{editingUuid ? 'Atualizar Máquina' : 'Salvar Máquina'}</button></div>
        </form>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500"><Hourglass size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Horas Trabalhadas (Total)</span><span className="text-base font-bold text-slate-800 dark:text-white">{machines.reduce((sum, m) => sum + m.hoursWorked, 0)} Horas</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500"><Fuel size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Consumo Diesel Total</span><span className="text-base font-bold text-slate-800 dark:text-white">{totalFuel.toLocaleString('pt-BR')} Litros</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500"><ShieldAlert size={18} /></div>
          <div><span className="text-3xs text-slate-400 font-bold uppercase block">Disponibilidade Mecânica Média</span><span className="text-base font-bold text-slate-800 dark:text-white">{avgAvailability}%</span></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Wrench size={14} className="text-brand-600" /> Frota Registrada</h3>
          <div className="relative w-64"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar máquina..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Equipamento</th><th className="py-3 px-4">Tipo</th><th className="py-3 px-4 text-center">Horas</th><th className="py-3 px-4 text-center">Diesel (L)</th><th className="py-3 px-4 text-right">Custo Manut. (R$)</th><th className="py-3 px-4 text-center">Disp. (%)</th><th className="py-3 px-4 text-right">R$/Hora</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredMachines.map(m => (
                <tr key={m.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{m.name}</td>
                  <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-3xs font-semibold">{m.type}</span></td>
                  <td className="py-3.5 px-4 text-center">{m.hoursWorked}</td>
                  <td className="py-3.5 px-4 text-center">{m.fuelConsumed.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right">R$ {m.maintenanceCost.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-center font-bold">{m.availability}%</td>
                  <td className="py-3.5 px-4 text-right">R$ {m.costPerHour.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-center"><span className={`px-2 py-0.5 rounded text-3xs font-bold ${m.status.includes('Dispon') ? 'bg-emerald-500/10 text-emerald-600' : m.status.includes('Manuten') ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>{m.status}</span></td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(m.uuid, m.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Custo de Manutenção */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-4">Custo de Manutenção por Equipamento (R$)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={machines.map(m => ({ name: m.name.length > 20 ? m.name.substring(0, 20) + '…' : m.name, Custo: m.maintenanceCost }))}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} />
            <Bar dataKey="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
