import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HardDrive, Landmark, ShieldCheck, Scale, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '../Toast';

export const AssetModule: React.FC = () => {
  const { assets, addAsset, updateAsset, removeAsset } = useApp();
  const { showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Terras' | 'Máquinas' | 'Implementos' | 'Veículos' | 'Equipamentos' | 'Benfeitorias' | 'Animais'>('Máquinas');
  const [acqDate, setAcqDate] = useState('');
  const [initialVal, setInitialVal] = useState('');
  const [deprRate, setDeprRate] = useState('');
  const [usefulLife, setUsefulLife] = useState('');
  const [status, setStatus] = useState('Ativo');

  const resetForm = () => {
    setName('');
    setAcqDate('');
    setInitialVal('');
    setDeprRate('');
    setUsefulLife('');
    setStatus('Ativo');
    setEditingUuid(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !acqDate || !initialVal) return;

    if (editingUuid) {
      updateAsset(editingUuid, {
        name,
        category,
        acquisitionDate: acqDate,
        initialValue: parseFloat(initialVal),
        currentValue: parseFloat(initialVal),
        depreciationRate: parseFloat(deprRate) || 0,
        usefulLifeYears: parseFloat(usefulLife) || 10,
        status
      });
      showToast('Ativo atualizado com sucesso!');
    } else {
      addAsset({
        name,
        category,
        acquisitionDate: acqDate,
        initialValue: parseFloat(initialVal),
        depreciationRate: parseFloat(deprRate) || 0,
        usefulLifeYears: parseFloat(usefulLife) || 10,
        status
      });
      showToast('Novo ativo cadastrado com sucesso!');
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (a: typeof assets[0]) => {
    setEditingUuid(a.uuid);
    setName(a.name);
    setCategory(a.category);
    setAcqDate(a.acquisitionDate);
    setInitialVal(String(a.initialValue));
    setDeprRate(String(a.depreciationRate));
    setUsefulLife(String(a.usefulLifeYears));
    setStatus(a.status);
    setShowAddForm(true);
  };

  const handleDelete = (uuid: string, assetName: string) => {
    if (confirm(`Tem certeza que deseja excluir "${assetName}"?`)) {
      removeAsset(uuid);
      showToast('Ativo excluído.', 'error');
    }
  };

  // Calcula a depreciação acumulada até hoje, respeitando a vida útil do ativo
  // (após o fim da vida útil, a depreciação para de avançar).
  const calculateDepreciation = (initial: number, rate: number, date: string, cat: string, usefulLifeYears: number) => {
    if (cat === 'Terras' || cat === 'Animais') return 0;
    const acqYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.min(Math.max(0, currentYear - acqYear), usefulLifeYears);
    return Math.min(initial, initial * (rate / 100) * age);
  };

  // Valor atualizado real do ativo: para categorias que depreciam, é sempre recalculado
  // a partir da depreciação acumulada (evita que o valor exibido fique desatualizado);
  // Terras e Animais não depreciam e mantêm o valor de mercado informado manualmente.
  const calculateCurrentValue = (a: typeof assets[0]) => {
    if (a.category === 'Terras' || a.category === 'Animais') return a.currentValue;
    const deprAcum = calculateDepreciation(a.initialValue, a.depreciationRate, a.acquisitionDate, a.category, a.usefulLifeYears);
    return Math.max(0, a.initialValue - deprAcum);
  };

  // Métricas
  const totalPatrimonial = assets.reduce((sum, a) => sum + calculateCurrentValue(a), 0);
  const totalImobilizado = assets.filter(a => a.category !== 'Terras' && a.category !== 'Animais').reduce((sum, a) => sum + calculateCurrentValue(a), 0);

  // Filtro de busca
  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Gestão Patrimonial e Imobilizados
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe a valoração de terras, frotas, equipamentos e semoventes com cálculo automático de depreciação.
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          {showAddForm ? 'Fechar Formulário' : 'Novo Ativo'}
        </button>
      </div>

      {/* Formulário */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 animate-fade-in">
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Nome do Ativo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Trator John Deere 6115J" className={inputClass} />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={inputClass}>
              <option value="Terras">Terras</option>
              <option value="Máquinas">Máquinas</option>
              <option value="Implementos">Implementos</option>
              <option value="Veículos">Veículos</option>
              <option value="Equipamentos">Equipamentos</option>
              <option value="Benfeitorias">Benfeitorias</option>
              <option value="Animais">Animais</option>
            </select>
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Data de Aquisição</label>
            <input type="date" required value={acqDate} onChange={(e) => setAcqDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Valor Inicial (R$)</label>
            <input type="number" required value={initialVal} onChange={(e) => setInitialVal(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Depreciação (%/ano)</label>
            <input type="number" required value={deprRate} onChange={(e) => setDeprRate(e.target.value)} placeholder="10" className={inputClass} />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Vida Útil (Anos)</label>
            <input type="number" required value={usefulLife} onChange={(e) => setUsefulLife(e.target.value)} placeholder="10" className={inputClass} />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className="flex items-end md:col-span-5">
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors ml-auto">
              {editingUuid ? 'Atualizar Ativo' : 'Salvar Ativo'}
            </button>
          </div>
        </form>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Landmark size={22} /></div>
          <div>
            <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">Valor Patrimonial Total</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">R$ {totalPatrimonial.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><HardDrive size={22} /></div>
          <div>
            <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">Total Imobilizado (Máquinas/Benfeitorias)</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">R$ {totalImobilizado.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400"><Scale size={22} /></div>
          <div>
            <span className="text-3xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">Terras Próprias Avaliadas</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">R$ {assets.filter(a => a.category === 'Terras').reduce((sum, a) => sum + calculateCurrentValue(a), 0).toLocaleString('pt-BR')}</h3>
          </div>
        </div>
      </div>

      {/* Tabela de Ativos */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">Inventário Patrimonial Ativo</h3>
          <div className="relative w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ativo..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Ativo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Aquisição</th>
                <th className="py-3 px-4 text-right">Valor Inicial</th>
                <th className="py-3 px-4 text-center">Depr. Anual</th>
                <th className="py-3 px-4 text-right">Depr. Acumulada</th>
                <th className="py-3 px-4 text-right">Valor Atualizado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {filteredAssets.map(a => {
                const deprAcum = calculateDepreciation(a.initialValue, a.depreciationRate, a.acquisitionDate, a.category, a.usefulLifeYears);
                return (
                  <tr key={a.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{a.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-3xs font-semibold text-slate-600 dark:text-slate-400">{a.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{a.acquisitionDate}</td>
                    <td className="py-3.5 px-4 text-right">R$ {a.initialValue.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {a.category === 'Terras' || a.category === 'Animais' ? '-' : `${a.depreciationRate}%`}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-500 font-medium">
                      {deprAcum > 0 ? `(-) R$ ${deprAcum.toLocaleString('pt-BR')}` : 'R$ 0'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      R$ {calculateCurrentValue(a).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-3xs font-bold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={12} /> {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Editar">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(a.uuid, a.name)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Excluir">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
