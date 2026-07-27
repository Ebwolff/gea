import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  BarChart3, 
  Map, 
  Sprout, 
  Hammer, 
  Truck, 
  Wrench, 
  Users, 
  Boxes, 
  ShoppingCart, 
  UsersRound, 
  HandCoins, 
  Coins, 
  FileSpreadsheet, 
  Scale, 
  CheckSquare, 
  Files, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
  Target
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [collapsed, setCollapsed] = React.useState(false);

  const menuGroups: SidebarGroup[] = [
    {
      title: 'Estratégico',
      items: [
        { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
        { id: 'diagnosis', label: 'Diagnóstico Estratégico', icon: ClipboardCheck },
        { id: 'indicators', label: 'Painel de Indicadores', icon: TrendingUp },
        { id: 'actionplan', label: 'Plano de Ação', icon: CheckSquare },
        { id: 'planning', label: 'Plan. Estratégico', icon: Target }
      ]
    },
    {
      title: 'Operacional',
      items: [
        { id: 'properties', label: 'Propriedades', icon: Building },
        { id: 'fields', label: 'Talhões', icon: Map },
        { id: 'production', label: 'Produção e Safra', icon: Sprout },
        { id: 'employees', label: 'Funcionários', icon: Users }
      ]
    },
    {
      title: 'Patrimônio e Frota',
      items: [
        { id: 'assets', label: 'Bens Patrimoniais', icon: Hammer },
        { id: 'machines', label: 'Máquinas e Frota', icon: Truck },
        { id: 'implements', label: 'Implementos', icon: Wrench }
      ]
    },
    {
      title: 'Suprimentos',
      items: [
        { id: 'stock', label: 'Estoque de Insumos', icon: Boxes },
        { id: 'purchases', label: 'Compras e Pedidos', icon: ShoppingCart },
        { id: 'suppliers', label: 'Fornecedores', icon: UsersRound },
        { id: 'clients', label: 'Clientes', icon: HandCoins }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'cashflow', label: 'Fluxo de Caixa', icon: Coins },
        { id: 'dre', label: 'Demonstrativo (DRE)', icon: FileSpreadsheet },
        { id: 'balance', label: 'Balanço Patrimonial', icon: Scale }
      ]
    },
    {
      title: 'Suporte',
      items: [
        { id: 'documents', label: 'Documentos', icon: Files },
        { id: 'reports', label: 'Relatórios Gerenciais', icon: BarChart3 },
        { id: 'settings', label: 'Configurações', icon: Settings }
      ]
    }
  ];

  return (
    <aside 
      className={`glass-panel border-r flex flex-col transition-all duration-300 z-20 ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen sticky top-0`}
    >
      {/* Header do Menu */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-dark-border/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-sm shadow-emerald-500/20">
            G
          </div>
          {!collapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent truncate font-display">
              Gea
            </span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Itens do Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                        isActive 
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/10' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon 
                        size={18} 
                        className={`flex-shrink-0 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                        }`} 
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Rodapé do Menu */}
      {!collapsed && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-dark-border/50 text-2xs text-slate-400 text-center">
          <div>Gea Agro &copy; 2026</div>
          <div className="text-3xs text-brand-600 dark:text-brand-500 font-semibold mt-0.5">Controladoria Estratégica</div>
        </div>
      )}
    </aside>
  );
};
