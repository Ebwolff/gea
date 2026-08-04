import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, TrendingUp, Sliders, Plus, Pencil, Trash2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from '../Toast';

const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100";

export const PlanningModule: React.FC = () => {
  const { financialTransactions, farmFilter, strategicGoals, addStrategicGoal, updateStrategicGoal, removeStrategicGoal } = useApp();
  const { showToast } = useToast();
  const [costMultiplier, setCostMultiplier] = useState(1); // 1 = 100%
  const [yieldMultiplier, setYieldMultiplier] = useState(1);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalUuid, setEditingGoalUuid] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalProgress, setGoalProgress] = useState('Planejado');

  const resetGoalForm = () => {
    setGoalTitle(''); setGoalCategory(''); setGoalDescription(''); setGoalTargetDate('');
    setGoalProgress('Planejado'); setEditingGoalUuid(null);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    const data = { title: goalTitle, category: goalCategory, description: goalDescription, targetDate: goalTargetDate, progress: goalProgress };
    if (editingGoalUuid) { updateStrategicGoal(editingGoalUuid, data); showToast('Objetivo atualizado!'); }
    else { addStrategicGoal(data); showToast('Novo objetivo cadastrado!'); }
    resetGoalForm(); setShowGoalForm(false);
  };

  const handleGoalEdit = (g: typeof strategicGoals[0]) => {
    setEditingGoalUuid(g.uuid); setGoalTitle(g.title); setGoalCategory(g.category);
    setGoalDescription(g.description); setGoalTargetDate(g.targetDate ?? ''); setGoalProgress(g.progress);
    setShowGoalForm(true);
  };

  const handleGoalDelete = (uuid: string, title: string) => {
    if (confirm(`Excluir objetivo "${title}"?`)) { removeStrategicGoal(uuid); showToast('Objetivo excluído.', 'error'); }
  };

  // Projeção baseada nos multiplicadores, a partir da receita/custo real
  // acumulados nas transações financeiras (filtradas pela fazenda ativa).
  const relevantTransactions = financialTransactions.filter(t => farmFilter === 'Todas' || t.farm === farmFilter);
  const baseRevenue = relevantTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const baseCost = relevantTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);

  const simulatedRevenue = baseRevenue * yieldMultiplier;
  const simulatedCost = baseCost * costMultiplier;
  const simulatedProfit = simulatedRevenue - simulatedCost;

  const projectionData = [
    { ano: '2026 (Atual)', Lucro: simulatedProfit },
    { ano: '2027 (Proj)', Lucro: simulatedProfit * 1.08 },
    { ano: '2028 (Proj)', Lucro: simulatedProfit * 1.15 },
    { ano: '2029 (Proj)', Lucro: simulatedProfit * 1.25 }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Planejamento Estratégico e Orçamento Projetado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Realize simulações de cenários econômicos e planeje os objetivos de longo prazo da fazenda.
          </p>
        </div>
      </div>

      {/* Simulador de Cenários de Sensibilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Sliders size={14} className="text-brand-600" />
            Parâmetros de Sensibilidade (O que aconteceria se...)
          </h3>
          <p className="text-3xs text-slate-400 leading-relaxed">
            Mova os controles deslizantes para projetar impactos instantâneos de flutuação de custos operacionais e produtividades físicas.
          </p>
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-2xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Variação de Custos Operacionais</span>
                <span className="text-brand-600 dark:text-brand-400">{Math.round((costMultiplier - 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={costMultiplier}
                onChange={(e) => setCostMultiplier(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-2xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Variação de Produtividade / Preço</span>
                <span className="text-brand-600 dark:text-brand-400">+{Math.round((yieldMultiplier - 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.05"
                value={yieldMultiplier}
                onChange={(e) => setYieldMultiplier(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-2xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Custos Simulados:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">R$ {Math.round(simulatedCost).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Receitas Simuladas:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">R$ {Math.round(simulatedRevenue).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 font-black">
              <span className="text-slate-700 dark:text-slate-300">Lucro Projetado:</span>
              <span className="text-brand-600 dark:text-brand-400">R$ {Math.round(simulatedProfit).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Projeção */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <TrendingUp size={14} className="text-brand-600" />
            Curva de Lucratividade Estimada (Próximos Anos)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <XAxis dataKey="ano" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `R$ ${Math.round(v/1000)}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Objetivos Estratégicos */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Target size={14} className="text-brand-600" />
            Objetivos Estratégicos Chaves (Metas OKR)
          </h3>
          <button onClick={() => { setShowGoalForm(!showGoalForm); if (showGoalForm) resetGoalForm(); }} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
            {showGoalForm ? 'Fechar' : (<><Plus size={14} /> Novo Objetivo</>)}
          </button>
        </div>

        {showGoalForm && (
          <form onSubmit={handleGoalSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-dark-border animate-fade-in">
            <div className="md:col-span-2"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Título</label><input required value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="Ex: Expansão de Terras" className={inputClass} /></div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label><input value={goalCategory} onChange={e => setGoalCategory(e.target.value)} placeholder="Ex: Governança" className={inputClass} /></div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Prazo</label><input type="date" value={goalTargetDate} onChange={e => setGoalTargetDate(e.target.value)} className={inputClass} /></div>
            <div className="md:col-span-3"><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Descrição</label><input value={goalDescription} onChange={e => setGoalDescription(e.target.value)} placeholder="Descreva a meta" className={inputClass} /></div>
            <div><label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Progresso</label><select value={goalProgress} onChange={e => setGoalProgress(e.target.value)} className={inputClass}><option value="Planejado">Planejado</option><option value="Em andamento">Em andamento</option><option value="Concluído">Concluído</option></select></div>
            <div className="flex items-end md:col-span-4"><button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold ml-auto">{editingGoalUuid ? 'Atualizar' : 'Salvar'}</button></div>
          </form>
        )}

        {strategicGoals.length === 0 ? (
          <p className="text-3xs text-slate-400 py-4 text-center">Nenhum objetivo estratégico cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategicGoals.map(g => (
              <div key={g.uuid} className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between h-32 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-extrabold text-brand-600 dark:text-brand-400 uppercase truncate">{g.category || 'Geral'}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleGoalEdit(g)} className="p-1 rounded hover:bg-blue-500/10 text-blue-500" title="Editar"><Pencil size={11} /></button>
                    <button onClick={() => handleGoalDelete(g.uuid, g.title)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500" title="Excluir"><Trash2 size={11} /></button>
                  </div>
                </div>
                <p className="text-2xs font-bold text-slate-700 dark:text-slate-200">{g.title}{g.description ? ` — ${g.description}` : ''}{g.targetDate ? ` até ${g.targetDate}` : ''}</p>
                <span className="text-4xs text-slate-400 font-semibold">Progresso: {g.progress}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
