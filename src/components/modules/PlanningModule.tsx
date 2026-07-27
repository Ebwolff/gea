import React, { useState } from 'react';
import { Target, TrendingUp, Sliders } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const PlanningModule: React.FC = () => {
  const [costMultiplier, setCostMultiplier] = useState(1); // 1 = 100%
  const [yieldMultiplier, setYieldMultiplier] = useState(1);

  // Projeção baseada nos multiplicadores
  // Receita base: R$ 1.280.000
  // Custo base: R$ 565.300
  const baseRevenue = 1280000;
  const baseCost = 565300;

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
        <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          <Target size={14} className="text-brand-600" />
          Objetivos Estratégicos Chaves (Metas OKR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between h-28">
            <span className="text-3xs font-extrabold text-brand-600 dark:text-brand-400 uppercase">Expansão de Terras</span>
            <p className="text-2xs font-bold text-slate-700 dark:text-slate-200">Expandir a área de cultivo arrendada em 15% (Sorriso-MT) até 2027.</p>
            <span className="text-4xs text-slate-400 font-semibold">Progresso: Em andamento</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between h-28">
            <span className="text-3xs font-extrabold text-brand-600 dark:text-brand-400 uppercase">Governança Familiar</span>
            <p className="text-2xs font-bold text-slate-700 dark:text-slate-200">Estruturar e assinar o Protocolo de Sucessão Familiar até Dezembro/2026.</p>
            <span className="text-4xs text-slate-400 font-semibold">Progresso: 50% concluído</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between h-28">
            <span className="text-3xs font-extrabold text-brand-600 dark:text-brand-400 uppercase">Mecanização</span>
            <p className="text-2xs font-bold text-slate-700 dark:text-slate-200">Substituir frota de tratores com mais de 10 anos, reduzindo custo de corretiva em 20%.</p>
            <span className="text-4xs text-slate-400 font-semibold">Progresso: Planejado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
