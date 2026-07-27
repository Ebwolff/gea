import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Check, Sparkles } from 'lucide-react';

export const ActionPlanModule: React.FC = () => {
  const { actionPlans, addManualActionPlan, updateActionPlanStatus } = useApp();
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário
  const [problem, setProblem] = useState('');
  const [cause, setCause] = useState('');
  const [impact, setImpact] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [owner, setOwner] = useState('Gerente da Fazenda');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !deadline) return;

    addManualActionPlan({
      problem,
      cause,
      impact,
      priority,
      owner,
      deadline,
      status: 'nao_iniciado',
      comments: 'Inserido de forma manual pelo consultor.'
    });

    setProblem('');
    setCause('');
    setImpact('');
    setDeadline('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Planos de Ação (5W2H)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie contramedidas automáticas criadas pelo diagnóstico ou adicione tarefas estratégicas corretivas.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Plus size={14} /> Novo Plano Manual
        </button>
      </div>

      {/* Formulário de Novo Plano */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="md:col-span-2">
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Problema Identificado</label>
            <input
              type="text"
              required
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="O que está acontecendo?"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Prazo Limite</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Causa Provável</label>
            <input
              type="text"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              placeholder="Por que está ocorrendo?"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Impacto no Negócio</label>
            <input
              type="text"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="Qual o risco/dano?"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-bold text-slate-400 uppercase mb-1 block">Responsável</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Responsável..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="md:col-span-3 flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Registrar Plano
            </button>
          </div>
        </form>
      )}

      {/* Informativo IA */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 border border-emerald-500/20">
        <Sparkles size={16} />
        Controle Inteligente: Há {actionPlans.filter(p => p.status !== 'concluido').length} planos de ação ativos vinculados ao diagnóstico de conformidade.
      </div>

      {/* Tabela de Planos de Ação */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-dark-border/50 bg-slate-50/40 dark:bg-slate-900/30">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white">Matriz de Execução de Metas (5W2H)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-dark-border/50 text-slate-400 font-bold uppercase tracking-wider text-4xs">
                <th className="py-3 px-4">Problema / Vulnerabilidade</th>
                <th className="py-3 px-4">Causa</th>
                <th className="py-3 px-4">Impacto / Risco</th>
                <th className="py-3 px-4 text-center">Prioridade</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4 text-center">Prazo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-border/50">
              {actionPlans.map(plan => {
                let prioColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                if (plan.priority === 'alta') prioColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                if (plan.priority === 'media') prioColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';

                return (
                  <tr key={plan.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{plan.problem}</td>
                    <td className="py-3.5 px-4 text-slate-500">{plan.cause}</td>
                    <td className="py-3.5 px-4 text-slate-500">{plan.impact}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-4xs font-bold uppercase ${prioColor}`}>
                        {plan.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{plan.owner}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{plan.deadline}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                        plan.status === 'concluido' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {plan.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {plan.status !== 'concluido' ? (
                        <button
                          onClick={() => updateActionPlanStatus(plan.uuid, 'concluido')}
                          className="p-1 rounded bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                          title="Marcar como Concluído"
                        >
                          <Check size={12} />
                        </button>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
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
