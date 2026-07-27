import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const DashboardModule: React.FC = () => {
  const { indices, financialTransactions, actionPlans, farmFilter, farms, assets, fields } = useApp();

  // Filtragem dos dados de exibição conforme fazenda/safra selecionada
  const isAllFarms = farmFilter === 'Todas';
  const filteredTransactions = financialTransactions.filter(t => isAllFarms || t.farm === farmFilter);

  // Totais financeiros (calculados com base nas transações)
  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => acc + t.value, 0);

  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + t.value, 0);

  const lucroLiquido = receitas - despesas;
  const ebitda = receitas - (despesas * 0.85); // EBITDA fictício baseado nas despesas operacionais

  // Valoração patrimonial = soma do valor atual dos ativos cadastrados
  // (não desconta passivos/dívidas, que ainda não são rastreados no sistema).
  const patrimonioLiquido = assets.reduce((sum, a) => sum + a.currentValue, 0);

  const areaTotal = isAllFarms
    ? farms.reduce((sum, f) => sum + f.areaTotal, 0)
    : (farms.find(f => f.name === farmFilter)?.areaTotal ?? 0);
  const receitaPorHa = areaTotal > 0 ? receitas / areaTotal : 0;
  const lucroPorHa = areaTotal > 0 ? lucroLiquido / areaTotal : 0;

  // Fluxo de Caixa Mensal: agrupa as transações reais pelo mês/ano de cada lançamento.
  const cashFlowByMonth = new Map<string, { name: string; Entradas: number; Saídas: number; sortKey: string }>();
  filteredTransactions.forEach(t => {
    const d = new Date(t.date + 'T00:00:00');
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MESES_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    const entry = cashFlowByMonth.get(sortKey) ?? { name: label, Entradas: 0, Saídas: 0, sortKey };
    if (t.type === 'receita') entry.Entradas += t.value; else entry.Saídas += t.value;
    cashFlowByMonth.set(sortKey, entry);
  });
  const cashFlowData = Array.from(cashFlowByMonth.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // Rentabilidade por Cultura: agrupa os talhões reais (fields) por cultura.
  const cropTotals = new Map<string, { Receita: number; Custo: number }>();
  fields.forEach(f => {
    const entry = cropTotals.get(f.culture) ?? { Receita: 0, Custo: 0 };
    entry.Receita += f.revenueHa * f.area;
    entry.Custo += f.productionCostHa * f.area;
    cropTotals.set(f.culture, entry);
  });
  const cropPerformanceData = Array.from(cropTotals.entries()).map(([name, v]) => ({
    name, Receita: v.Receita, Custo: v.Custo, Lucro: v.Receita - v.Custo
  }));

  // Dados do radar de diagnóstico
  const radarData = [
    { subject: 'Governança', A: indices.governance, B: 75, fullMark: 100 },
    { subject: 'Financeiro', A: indices.financial, B: 80, fullMark: 100 },
    { subject: 'Operacional', A: indices.operational, B: 85, fullMark: 100 },
    { subject: 'Comercial', A: indices.commercial, B: 80, fullMark: 100 },
    { subject: 'Patrimonial', A: indices.patrimonial, B: 90, fullMark: 100 },
    { subject: 'Administrativo', A: indices.administrative, B: 85, fullMark: 100 }
  ];

  const pendingActions = actionPlans.filter(p => p.status !== 'concluido').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Bloco de Informações Executivas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {farmFilter === 'Todas' ? 'Dados consolidados do grupo agropecuário' : `Acompanhamento estratégico: ${farmFilter}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
            IA Insights: Margem geral saudável de {receitas > 0 ? Math.round((lucroLiquido / receitas) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Grid de Kpis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Receita Total</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><TrendingUp size={16} /></span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">R$ {receitas.toLocaleString('pt-BR')}</h3>
            <p className="text-3xs text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +12.4% vs Safra anterior
            </p>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Lucro Líquido</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><DollarSign size={16} /></span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">R$ {lucroLiquido.toLocaleString('pt-BR')}</h3>
            <p className="text-3xs text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +8.2% vs Safra anterior
            </p>
          </div>
        </div>

        {/* EBITDA */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">EBITDA</span>
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400"><Activity size={16} /></span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">R$ {ebitda.toLocaleString('pt-BR')}</h3>
            <p className="text-3xs text-rose-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowDownRight size={10} /> -1.8% vs Orçado (custo diesel)
            </p>
          </div>
        </div>

        {/* IGR (Índice de Gestão Rural) */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Maturidade (IGR)</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-3xs font-extrabold">Fazenda</span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{indices.overall}%</h3>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {indices.overall >= 75 ? 'Excelente' : indices.overall >= 50 ? 'Médio' : 'Crítico'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-600 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${indices.overall}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Eficiência por Área */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receita/ha */}
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            /ha
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Receita por Hectare</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">R$ {Math.round(receitaPorHa).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Lucro/ha */}
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            /ha
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Lucro por Hectare</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">R$ {Math.round(lucroPorHa).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Patrimônio Líquido */}
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            PL
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-semibold block uppercase">Valoração Patrimonial</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">R$ {patrimonioLiquido.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo de Caixa Mensal */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-3.5 bg-brand-600 rounded-full block" />
            Fluxo de Caixa Mensal (Realizado)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="Saídas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnóstico de Controladoria - Radar */}
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-3.5 bg-brand-600 rounded-full block" />
            Estrutura de Diagnóstico (%)
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar name="Atual" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Meta do Grupo" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.05} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rentabilidade por Lavouras */}
        <div className="glass-panel p-5 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-3.5 bg-brand-600 rounded-full block" />
            Rentabilidade por Cultura (Total Safra)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropPerformanceData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `R$ ${(v/1000000).toFixed(1)}M`} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Receita" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custo" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lucro" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas e Próximas Atividades */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-red-500 rounded-full block" />
              Alertas & Planos Urgentes
            </h3>
            <div className="space-y-3">
              {pendingActions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold">Tudo em dia!</p>
                  <p className="text-3xs text-center">Nenhum plano de ação atrasado ou crítico.</p>
                </div>
              ) : (
                pendingActions.map(action => (
                  <div key={action.uuid} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5">
                    <span className="p-1 rounded bg-red-500/10 text-red-500 mt-0.5"><ShieldAlert size={14} /></span>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-3xs font-bold text-red-600 dark:text-red-400 uppercase">{action.priority} prioridade</span>
                        <span className="text-3xs text-slate-400 font-medium">{action.deadline}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{action.problem}</h4>
                      <p className="text-3xs text-slate-400 dark:text-slate-500 truncate mt-0.5">Responsável: {action.owner}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-2xs">
            <span className="text-slate-400">Próxima auditoria física:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">22/07/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
