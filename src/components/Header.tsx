import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, User, Calendar, Briefcase } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    theme, setTheme, 
    cropFilter, setCropFilter, 
    farmFilter, setFarmFilter,
    userProfile, setUserProfile,
    farms,
    actionPlans,
    stock
  } = useApp();

  // Conta alertas ativos
  const criticalStockCount = stock.filter(s => s.quantity <= s.minQuantity).length;
  const criticalActionsCount = actionPlans.filter(ap => ap.priority === 'alta' && ap.status !== 'concluido').length;
  const totalAlerts = criticalStockCount + criticalActionsCount;

  const profiles = [
    'Administrador',
    'Consultor',
    'Produtor Rural',
    'Gestor Financeiro',
    'Gerente da Fazenda',
    'Funcionário',
    'Contador (Leitura)'
  ];

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border-b border-slate-200/50 dark:border-dark-border/50 h-16 px-6 flex items-center justify-between z-10">
      {/* Filtros e Seleções da Fazenda */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Seletor de Fazenda */}
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-slate-400" />
          <select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-3 focus:ring-1 focus:ring-brand-500 cursor-pointer outline-none"
          >
            <option value="Todas">Todas as Propriedades</option>
            {farms.map(f => (
              <option key={f.uuid} value={f.name}>{f.name} ({f.municipio}-{f.estado})</option>
            ))}
          </select>
        </div>

        {/* Seletor de Safra */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-3 focus:ring-1 focus:ring-brand-500 cursor-pointer outline-none"
          >
            <option value="2025/26">Safra 2025/26</option>
            <option value="2024/25">Safra 2024/25</option>
            <option value="2023/24">Safra 2023/24</option>
          </select>
        </div>
      </div>

      {/* Ações, Perfil e Alternador de Tema */}
      <div className="flex items-center gap-4">
        {/* Seletor de Perfil do Usuário */}
        <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
          <User size={16} className="text-slate-400" />
          <span className="text-2xs text-slate-400 dark:text-slate-500 font-semibold hidden md:inline">Perfil:</span>
          <select
            value={userProfile}
            onChange={(e) => setUserProfile(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-2xs font-bold text-brand-600 dark:text-brand-400 py-1 px-2.5 focus:ring-1 focus:ring-brand-500 cursor-pointer outline-none"
          >
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Alternador de Tema Claro/Escuro */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Alternar Tema"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notificações com Badge de Alertas */}
        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title={`${totalAlerts} Alertas Críticos`}
          >
            <Bell size={18} />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white dark:border-dark-card rounded-full text-3xs font-extrabold text-white flex items-center justify-center animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>
        </div>

        {/* Perfil Mini */}
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            {userProfile.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {userProfile === 'Consultor' ? 'Dr. Marcelo Silva' : 'Produtor Agrícola'}
            </div>
            <div className="text-3xs text-slate-400 dark:text-slate-500">
              {userProfile}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
