import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AiAssistant } from './components/AiAssistant';

// Import de Módulos
import { DashboardModule } from './components/modules/DashboardModule';
import { DiagnosisModule } from './components/modules/DiagnosisModule';
import { FinancialModule } from './components/modules/FinancialModule';
import { AssetModule } from './components/modules/AssetModule';
import { ProductionModule } from './components/modules/ProductionModule';
import { MachineModule } from './components/modules/MachineModule';
import { StockModule } from './components/modules/StockModule';
import { PurchaseModule } from './components/modules/PurchaseModule';
import { IndicatorsModule } from './components/modules/IndicatorsModule';
import { ActionPlanModule } from './components/modules/ActionPlanModule';
import { PropertiesModule } from './components/modules/PropertiesModule';
import { EmployeesModule } from './components/modules/EmployeesModule';
import { PlanningModule } from './components/modules/PlanningModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { 
  ImplementsModule, 
  SuppliersModule, 
  ClientsModule, 
  DocumentsModule 
} from './components/modules/MiscModules';

function App() {
  const { activeTab, loading } = useApp();

  // Seletor de Renderização de Módulos
  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'diagnosis':
        return <DiagnosisModule />;
      case 'indicators':
        return <IndicatorsModule />;
      case 'actionplan':
        return <ActionPlanModule />;
      case 'planning':
        return <PlanningModule />;
      case 'properties':
        return <PropertiesModule />;
      case 'fields':
      case 'production':
        return <ProductionModule />;
      case 'employees':
        return <EmployeesModule />;
      case 'assets':
        return <AssetModule />;
      case 'machines':
        return <MachineModule />;
      case 'implements':
        return <ImplementsModule />;
      case 'stock':
        return <StockModule />;
      case 'purchases':
        return <PurchaseModule />;
      case 'suppliers':
        return <SuppliersModule />;
      case 'clients':
        return <ClientsModule />;
      case 'cashflow':
      case 'dre':
      case 'balance':
        return <FinancialModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Carregando dados da fazenda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      {/* Menu Lateral Fixo / Retrátil */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Painel Central Interno */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto pb-24">
          {renderModule()}
        </main>
      </div>

      {/* Assistente de Inteligência Artificial Flutuante */}
      <AiAssistant />
    </div>
  );
}

export default App;
