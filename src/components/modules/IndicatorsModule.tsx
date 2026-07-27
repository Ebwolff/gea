import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

type IndicatorCategory = 'Financeiro' | 'Produção' | 'Máquinas' | 'Patrimônio' | 'Pessoas' | 'Compras' | 'Estoque';

export const IndicatorsModule: React.FC = () => {
  const { indicators } = useApp();
  const [activeCategory, setActiveCategory] = useState<IndicatorCategory>('Financeiro');
  const [query, setQuery] = useState('');

  const categories: IndicatorCategory[] = [
    'Financeiro',
    'Produção',
    'Máquinas',
    'Patrimônio',
    'Pessoas',
    'Compras',
    'Estoque'
  ];

  // Filtra indicadores pela categoria e nome
  const filteredIndicators = indicators.filter(ind => 
    ind.category === activeCategory && 
    ind.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-dark-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            Painel Executivo de Indicadores (KPIs)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe mais de 100 indicadores estratégicos gerados de forma automática e consolidados.
          </p>
        </div>
      </div>

      {/* Barra de Filtros por Categoria */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat} ({indicators.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full md:w-64">
          <span className="absolute left-2.5 top-2 text-slate-400"><Search size={14} /></span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar entre os 100+ KPIs..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-2xs py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Grid de Indicadores */}
      <div className="indicator-grid">
        {filteredIndicators.map(ind => {
          let statusColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
          let bulletColor = 'bg-emerald-500';
          
          if (ind.status === 'bom') {
            statusColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            bulletColor = 'bg-blue-500';
          } else if (ind.status === 'alerta') {
            statusColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            bulletColor = 'bg-amber-500';
          } else if (ind.status === 'critico') {
            statusColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            bulletColor = 'bg-rose-500';
          }

          // Percentual de atingimento da meta
          const pct = ind.target > 0 ? Math.min(100, Math.round((ind.value / ind.target) * 100)) : 100;

          return (
            <div 
              key={ind.uuid} 
              className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col justify-between h-36 border-t-2 border-t-slate-200 dark:border-t-dark-border hover:border-t-brand-500 dark:hover:border-t-brand-500"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-2xs font-extrabold text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                    {ind.name}
                  </h4>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-4xs font-black uppercase ${statusColor}`}>
                    <span className={`w-1 h-1 rounded-full ${bulletColor}`} />
                    {ind.status}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-800 dark:text-white">
                    {typeof ind.value === 'number' && ind.value % 1 !== 0 
                      ? ind.value.toFixed(2) 
                      : ind.value.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-3xs text-slate-400 font-semibold">{ind.unit}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-4xs text-slate-400 font-bold mt-2">
                  <span>Meta: {ind.target.toLocaleString('pt-BR')} {ind.unit}</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      ind.status === 'critico' ? 'bg-rose-500' : ind.status === 'alerta' ? 'bg-amber-500' : 'bg-brand-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
