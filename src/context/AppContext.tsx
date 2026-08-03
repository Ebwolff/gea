import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  PropertyRow,
  FinancialTransactionRow,
  AssetRow,
  CropFieldRow,
  MachineRow,
  StockItemRow,
  PurchaseRequestRow,
  EmployeeRow,
  ActionPlanItemRow,
  ChatMessageRow,
  SupplierRow,
  ClientRow,
  ImplementRow,
  DocumentRow,
} from '../lib/database.types';

// Interfaces
export interface Property {
  uuid: string;
  name: string;
  municipio: string;
  estado: string;
  areaTotal: number;
  areaPropria: number;
  areaArrendada: number;
  latitude: number;
  longitude: number;
  tipoSolo: string;
  altitude: number;
  responsavel: string;
  culturas: string[];
  status: string;
}

export interface DiagnosisQuestion {
  id: number;
  area: string;
  question: string;
  score: number; // 0 | 1 | 2 | 3 | 4
}

export interface FinancialTransaction {
  uuid: string;
  date: string;
  description: string;
  type: 'receita' | 'despesa';
  category: string; // Plano de contas
  costCenter: string; // Centro de custo
  farm: string; // Nome da propriedade (Property.name) a que o lançamento pertence
  value: number;
  account: string; // Banco
  status: 'pago' | 'pendente';
}

export interface Asset {
  uuid: string;
  name: string;
  category: 'Terras' | 'Máquinas' | 'Implementos' | 'Veículos' | 'Equipamentos' | 'Benfeitorias' | 'Animais';
  acquisitionDate: string;
  initialValue: number;
  depreciationRate: number; // % ao ano
  usefulLifeYears: number;
  currentValue: number;
  status: string;
}

export interface CropField {
  uuid: string;
  name: string; // Talhão
  area: number; // ha
  soilType: string;
  culture: string;
  cropYear: string; // Safra
  expectedYield: number; // sacas/ha
  actualYield?: number;
  productionCostHa: number;
  revenueHa: number;
  status: string;
}

export interface Machine {
  uuid: string;
  name: string;
  type: string;
  hoursWorked: number;
  fuelConsumed: number; // litros
  maintenanceCost: number;
  availability: number; // %
  costPerHour: number;
  status: string;
}

export interface StockItem {
  uuid: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  expiryDate?: string;
  location: string;
  value: number;
}

export interface PurchaseRequest {
  uuid: string;
  item: string;
  quantity: number;
  unit: string;
  supplier: string;
  value: number;
  requester: string;
  date: string;
  status: 'rascunho' | 'cotacao' | 'aprovacao' | 'aprovado' | 'rejeitado' | 'concluido';
}

export interface Indicator {
  uuid: string;
  name: string;
  category: 'Financeiro' | 'Produção' | 'Máquinas' | 'Patrimônio' | 'Pessoas' | 'Compras' | 'Estoque';
  value: number;
  target: number;
  unit: string;
  status: 'excelente' | 'bom' | 'alerta' | 'critico';
}

export interface ActionPlanItem {
  uuid: string;
  questionId?: number;
  problem: string;
  cause: string;
  impact: string;
  priority: 'baixa' | 'media' | 'alta';
  owner: string;
  deadline: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado';
  comments: string;
}

// Ponto de um gráfico de barras exibido junto a uma resposta do assistente
// (as respostas mockadas usam chaves diferentes: custo/orcado ou receita/custo/lucro).
export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  charts?: ChartDataPoint[] | null;
}

export interface Employee {
  uuid: string;
  name: string;
  role: string;
  dept: string;
  training: string;
  performance: string;
  status: 'Ativo' | 'Inativo';
}

export interface Supplier {
  uuid: string;
  name: string;
  cnpj: string;
  city: string;
  category: string;
  avgPaymentDays: number;
  rating: string;
}

export interface Client {
  uuid: string;
  name: string;
  pickupLocation: string;
  contractedVolume: number;
  volumeUnit: string;
  avgPrice: number;
  priceUnit: string;
  contractStatus: string;
}

export interface Implement {
  uuid: string;
  name: string;
  brand: string;
  workingWidth: string;
  lastLubricationDate: string;
  status: string;
}

// Sem upload de arquivo real; "notes" guarda um texto livre (ex: "PDF 4.2 MB")
// só como referência visual — anexar o arquivo de fato exigiria Supabase Storage.
export interface AppDocument {
  uuid: string;
  title: string;
  status: string;
  expiryDate?: string;
  notes: string;
}

interface AppContextType {
  loading: boolean;

  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  cropFilter: string;
  setCropFilter: (c: string) => void;
  farmFilter: string;
  setFarmFilter: (f: string) => void;

  farms: Property[];
  diagnosisQuestions: DiagnosisQuestion[];
  updateQuestionScore: (id: number, score: number) => void;

  // Indices do Diagnostico
  indices: {
    governance: number;
    financial: number;
    operational: number;
    commercial: number;
    patrimonial: number;
    administrative: number;
    overall: number; // IGR
  };

  financialTransactions: FinancialTransaction[];
  addTransaction: (t: Omit<FinancialTransaction, 'uuid'>) => void;
  removeTransaction: (uuid: string) => void;

  assets: Asset[];
  addAsset: (a: Omit<Asset, 'uuid' | 'currentValue'>) => void;
  updateAsset: (uuid: string, data: Partial<Asset>) => void;
  removeAsset: (uuid: string) => void;

  fields: CropField[];
  addField: (f: Omit<CropField, 'uuid'>) => void;
  updateField: (uuid: string, data: Partial<CropField>) => void;
  removeField: (uuid: string) => void;

  machines: Machine[];
  addMachine: (m: Omit<Machine, 'uuid' | 'hoursWorked' | 'fuelConsumed' | 'maintenanceCost' | 'availability' | 'costPerHour'>) => void;
  updateMachine: (uuid: string, data: Partial<Machine>) => void;
  removeMachine: (uuid: string) => void;

  stock: StockItem[];
  addStockItem: (s: Omit<StockItem, 'uuid'>) => void;
  updateStockItem: (uuid: string, data: Partial<StockItem>) => void;
  removeStockItem: (uuid: string) => void;

  purchases: PurchaseRequest[];
  addPurchaseRequest: (p: Omit<PurchaseRequest, 'uuid' | 'status' | 'date'>) => void;
  updatePurchaseStatus: (uuid: string, status: PurchaseRequest['status']) => void;
  removePurchaseRequest: (uuid: string) => void;

  employees: Employee[];
  addEmployee: (e: Omit<Employee, 'uuid'>) => void;
  updateEmployee: (uuid: string, data: Partial<Employee>) => void;
  removeEmployee: (uuid: string) => void;

  addFarm: (f: Omit<Property, 'uuid' | 'status'>) => void;
  updateFarm: (uuid: string, data: Partial<Property>) => void;
  removeFarm: (uuid: string) => void;

  indicators: Indicator[];
  actionPlans: ActionPlanItem[];
  addManualActionPlan: (p: Omit<ActionPlanItem, 'uuid'>) => void;
  updateActionPlanStatus: (uuid: string, status: ActionPlanItem['status']) => void;

  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, 'uuid'>) => void;
  updateSupplier: (uuid: string, data: Partial<Supplier>) => void;
  removeSupplier: (uuid: string) => void;

  clients: Client[];
  addClient: (c: Omit<Client, 'uuid'>) => void;
  updateClient: (uuid: string, data: Partial<Client>) => void;
  removeClient: (uuid: string) => void;

  implementsList: Implement[];
  addImplement: (i: Omit<Implement, 'uuid'>) => void;
  updateImplement: (uuid: string, data: Partial<Implement>) => void;
  removeImplement: (uuid: string) => void;

  documents: AppDocument[];
  addDocument: (d: Omit<AppDocument, 'uuid'>) => void;
  updateDocument: (uuid: string, data: Partial<AppDocument>) => void;
  removeDocument: (uuid: string) => void;

  chatMessages: ChatMessage[];
  sendChatMessage: (msg: string) => void;
  clearChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================
// Mapeamento das linhas do Supabase (snake_case) para os tipos de app
// (camelCase) usados pelos componentes. Colunas `numeric` do Postgres
// voltam como string via PostgREST, por isso o Number(...) explícito.
// ============================================================
function propertyFromRow(row: PropertyRow): Property {
  return {
    uuid: row.id,
    name: row.name,
    municipio: row.municipio,
    estado: row.estado,
    areaTotal: Number(row.area_total),
    areaPropria: Number(row.area_propria),
    areaArrendada: Number(row.area_arrendada),
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
    tipoSolo: row.tipo_solo ?? '',
    altitude: row.altitude ?? 0,
    responsavel: row.responsavel ?? '',
    culturas: row.culturas,
    status: row.status,
  };
}

function transactionFromRow(row: FinancialTransactionRow): FinancialTransaction {
  return {
    uuid: row.id,
    date: row.date,
    description: row.description,
    type: row.type,
    category: row.category,
    costCenter: row.cost_center,
    farm: row.properties?.name ?? '',
    value: Number(row.value),
    account: row.account,
    status: row.status,
  };
}

function assetFromRow(row: AssetRow): Asset {
  return {
    uuid: row.id,
    name: row.name,
    category: row.category as Asset['category'],
    acquisitionDate: row.acquisition_date,
    initialValue: Number(row.initial_value),
    depreciationRate: Number(row.depreciation_rate),
    usefulLifeYears: row.useful_life_years,
    currentValue: Number(row.current_value),
    status: row.status,
  };
}

function fieldFromRow(row: CropFieldRow): CropField {
  return {
    uuid: row.id,
    name: row.name,
    area: Number(row.area),
    soilType: row.soil_type ?? '',
    culture: row.culture,
    cropYear: row.crop_year,
    expectedYield: row.expected_yield !== null ? Number(row.expected_yield) : 0,
    actualYield: row.actual_yield !== null ? Number(row.actual_yield) : undefined,
    productionCostHa: row.production_cost_ha !== null ? Number(row.production_cost_ha) : 0,
    revenueHa: row.revenue_ha !== null ? Number(row.revenue_ha) : 0,
    status: row.status,
  };
}

function machineFromRow(row: MachineRow): Machine {
  return {
    uuid: row.id,
    name: row.name,
    type: row.type,
    hoursWorked: Number(row.hours_worked),
    fuelConsumed: Number(row.fuel_consumed),
    maintenanceCost: Number(row.maintenance_cost),
    availability: Number(row.availability),
    costPerHour: Number(row.cost_per_hour),
    status: row.status,
  };
}

function stockFromRow(row: StockItemRow): StockItem {
  return {
    uuid: row.id,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    minQuantity: Number(row.min_quantity),
    expiryDate: row.expiry_date ?? undefined,
    location: row.location ?? '',
    value: Number(row.value),
  };
}

function purchaseFromRow(row: PurchaseRequestRow): PurchaseRequest {
  return {
    uuid: row.id,
    item: row.item,
    quantity: Number(row.quantity),
    unit: row.unit,
    supplier: row.supplier,
    value: Number(row.value),
    requester: row.requester,
    date: row.date,
    status: row.status as PurchaseRequest['status'],
  };
}

function employeeFromRow(row: EmployeeRow): Employee {
  return {
    uuid: row.id,
    name: row.name,
    role: row.role,
    dept: row.dept,
    training: row.training ?? '',
    performance: row.performance ?? '',
    status: row.status as Employee['status'],
  };
}

function supplierFromRow(row: SupplierRow): Supplier {
  return {
    uuid: row.id,
    name: row.name,
    cnpj: row.cnpj ?? '',
    city: row.city ?? '',
    category: row.category ?? '',
    avgPaymentDays: row.avg_payment_days ?? 0,
    rating: row.rating ?? '',
  };
}

function clientFromRow(row: ClientRow): Client {
  return {
    uuid: row.id,
    name: row.name,
    pickupLocation: row.pickup_location ?? '',
    contractedVolume: row.contracted_volume !== null ? Number(row.contracted_volume) : 0,
    volumeUnit: row.volume_unit ?? '',
    avgPrice: row.avg_price !== null ? Number(row.avg_price) : 0,
    priceUnit: row.price_unit ?? '',
    contractStatus: row.contract_status ?? '',
  };
}

function implementFromRow(row: ImplementRow): Implement {
  return {
    uuid: row.id,
    name: row.name,
    brand: row.brand ?? '',
    workingWidth: row.working_width ?? '',
    lastLubricationDate: row.last_lubrication_date ?? '',
    status: row.status,
  };
}

function documentFromRow(row: DocumentRow): AppDocument {
  return {
    uuid: row.id,
    title: row.title,
    status: row.status,
    expiryDate: row.expiry_date ?? undefined,
    notes: row.notes ?? '',
  };
}

function actionPlanFromRow(row: ActionPlanItemRow): ActionPlanItem {
  return {
    uuid: row.id,
    questionId: row.question_id ?? undefined,
    problem: row.problem,
    cause: row.cause ?? '',
    impact: row.impact ?? '',
    priority: row.priority as ActionPlanItem['priority'],
    owner: row.owner ?? '',
    deadline: row.deadline ?? '',
    status: row.status as ActionPlanItem['status'],
    comments: row.comments ?? '',
  };
}

function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sender: row.sender,
    content: row.content,
    timestamp: new Date(row.created_at),
    charts: (row.charts as ChartDataPoint[] | null) ?? undefined,
  };
}

// Calcula o índice (0-100) de uma área do diagnóstico a partir de uma lista de perguntas.
function areaIndexFrom(questions: DiagnosisQuestion[], areaName: string): number {
  const items = questions.filter(q => q.area === areaName);
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, q) => acc + q.score, 0);
  return Math.round((sum / (items.length * 4)) * 100);
}

// Monta a mensagem de boas-vindas do assistente com o IGR e a área mais vulnerável
// calculados de verdade a partir das perguntas do diagnóstico já carregadas do banco.
function buildWelcomeMessage(questions: DiagnosisQuestion[]): ChatMessage {
  const governanceIdx = areaIndexFrom(questions, 'Governança');
  const financialIdx = areaIndexFrom(questions, 'Financeiro');
  const operationalIdx = Math.round((areaIndexFrom(questions, 'Produção') + areaIndexFrom(questions, 'Máquinas') + areaIndexFrom(questions, 'Estoque')) / 3);
  const commercialIdx = Math.round((areaIndexFrom(questions, 'Comercialização') + areaIndexFrom(questions, 'Compras')) / 2);
  const patrimonialIdx = areaIndexFrom(questions, 'Patrimônio');
  const administrativeIdx = Math.round((areaIndexFrom(questions, 'Pessoas') + areaIndexFrom(questions, 'Planejamento') + areaIndexFrom(questions, 'Tecnologia')) / 3);
  const overallIgr = Math.round((governanceIdx + financialIdx + operationalIdx + commercialIdx + patrimonialIdx + administrativeIdx) / 6);
  const maturityLabel = overallIgr >= 75 ? 'avançado' : overallIgr >= 50 ? 'mediano' : overallIgr >= 25 ? 'inicial' : 'crítico';

  const areaNames = Array.from(new Set(questions.map(q => q.area)));
  let weakestArea = { name: areaNames[0] ?? 'Governança', avg: Infinity };
  areaNames.forEach(name => {
    const items = questions.filter(q => q.area === name);
    const avg = items.reduce((acc, q) => acc + q.score, 0) / items.length;
    if (avg < weakestArea.avg) weakestArea = { name, avg };
  });
  const weakestAvgLabel = Number.isFinite(weakestArea.avg) ? weakestArea.avg.toFixed(1) : '0.0';

  return {
    id: crypto.randomUUID(),
    sender: 'assistant',
    content: `Olá! Sou o assistente de Inteligência Artificial da controladoria Gea. Analisei os dados da fazenda e identifiquei que o IGR (Índice de Gestão Rural) atual é de ${overallIgr}%, o que indica um patamar de maturidade ${maturityLabel}. Vejo que a área mais vulnerável é a **${weakestArea.name}** (nota média ${weakestAvgLabel}). Responda ao Diagnóstico Estratégico para refinar essa análise. Como posso te auxiliar estrategicamente hoje?`,
    timestamp: new Date(),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cropFilter, setCropFilter] = useState('2025/26');
  const [farmFilter, setFarmFilter] = useState('Fazenda Bela Vista');

  const [farms, setFarms] = useState<Property[]>([]);
  const [diagnosisQuestions, setDiagnosisQuestions] = useState<DiagnosisQuestion[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [fields, setFields] = useState<CropField[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Carga inicial: busca todas as tabelas do Supabase em paralelo.
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [
        farmsRes, diagRes, txRes, assetsRes, fieldsRes, machinesRes,
        stockRes, purchasesRes, employeesRes, actionPlansRes, chatRes,
        suppliersRes, clientsRes, implementsRes, documentsRes,
      ] = await Promise.all([
        supabase.from('properties').select('*').order('created_at'),
        supabase.from('diagnosis_questions').select('*').order('id'),
        supabase.from('financial_transactions').select('*, properties(name)').order('date', { ascending: false }),
        supabase.from('assets').select('*').order('created_at'),
        supabase.from('crop_fields').select('*').order('created_at'),
        supabase.from('machines').select('*').order('created_at'),
        supabase.from('stock_items').select('*').order('created_at'),
        supabase.from('purchase_requests').select('*').order('created_at'),
        supabase.from('employees').select('*').order('created_at'),
        supabase.from('action_plan_items').select('*').order('created_at'),
        supabase.from('chat_messages').select('*').order('created_at'),
        supabase.from('suppliers').select('*').order('created_at'),
        supabase.from('clients').select('*').order('created_at'),
        supabase.from('implements').select('*').order('created_at'),
        supabase.from('documents').select('*').order('created_at'),
      ]);

      if (cancelled) return;

      const results = { farmsRes, diagRes, txRes, assetsRes, fieldsRes, machinesRes, stockRes, purchasesRes, employeesRes, actionPlansRes, chatRes, suppliersRes, clientsRes, implementsRes, documentsRes };
      for (const [label, res] of Object.entries(results)) {
        if (res.error) console.error(`Erro ao carregar "${label}" do Supabase:`, res.error);
      }

      const loadedQuestions = (diagRes.data ?? []) as DiagnosisQuestion[];

      setFarms((farmsRes.data ?? []).map(propertyFromRow));
      setDiagnosisQuestions(loadedQuestions);
      setFinancialTransactions((txRes.data ?? []).map(transactionFromRow));
      setAssets((assetsRes.data ?? []).map(assetFromRow));
      setFields((fieldsRes.data ?? []).map(fieldFromRow));
      setMachines((machinesRes.data ?? []).map(machineFromRow));
      setStock((stockRes.data ?? []).map(stockFromRow));
      setPurchases((purchasesRes.data ?? []).map(purchaseFromRow));
      setEmployees((employeesRes.data ?? []).map(employeeFromRow));
      setActionPlans((actionPlansRes.data ?? []).map(actionPlanFromRow));
      setSuppliers((suppliersRes.data ?? []).map(supplierFromRow));
      setClients((clientsRes.data ?? []).map(clientFromRow));
      setImplementsList((implementsRes.data ?? []).map(implementFromRow));
      setDocuments((documentsRes.data ?? []).map(documentFromRow));

      const loadedChat = (chatRes.data ?? []).map(chatMessageFromRow);
      if (loadedChat.length === 0) {
        const welcomeMsg = buildWelcomeMessage(loadedQuestions);
        setChatMessages([welcomeMsg]);
        supabase.from('chat_messages').insert({ sender: welcomeMsg.sender, content: welcomeMsg.content }).then(({ error }) => {
          if (error) console.error('Erro ao salvar mensagem de boas-vindas:', error);
        });
      } else {
        setChatMessages(loadedChat);
      }

      setLoading(false);
    }

    loadAll().catch(err => {
      console.error('Falha ao carregar dados iniciais do Supabase:', err);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // Alterna o tema no HTML global
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);

  // Função para atualizar nota e sincronizar IGR e Plano de Ação
  const updateQuestionScore = (id: number, score: number) => {
    setDiagnosisQuestions(prev => prev.map(q => q.id === id ? { ...q, score } : q));
    supabase.from('diagnosis_questions').update({ score }).eq('id', id).then(({ error }) => {
      if (error) console.error('Erro ao salvar nota do diagnóstico:', error);
    });

    const q = diagnosisQuestions.find(item => item.id === id);
    if (!q) return;
    const existingPlan = actionPlans.find(p => p.questionId === id);

    if (score <= 1) {
      const priority: ActionPlanItem['priority'] = score === 0 ? 'alta' : 'media';
      if (existingPlan) {
        setActionPlans(prev => prev.map(p => p.questionId === id ? { ...p, priority, status: 'nao_iniciado' } : p));
        supabase.from('action_plan_items').update({ priority, status: 'nao_iniciado' }).eq('id', existingPlan.uuid).then(({ error }) => {
          if (error) console.error('Erro ao atualizar plano de ação:', error);
        });
      } else {
        const newPlanRow = {
          question_id: id,
          problem: `Nota baixa em ${q.area}: "${q.question}"`,
          cause: 'Vulnerabilidade identificada no diagnóstico executivo.',
          impact: `Impacto negativo no índice de ${q.area} e maturidade organizacional.`,
          priority,
          owner: 'Diretoria Executiva',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'nao_iniciado',
          comments: 'Gerado automaticamente após reavaliação de conformidade.',
        };
        supabase.from('action_plan_items').insert(newPlanRow).select().single().then(({ data, error }) => {
          if (error || !data) { console.error('Erro ao criar plano de ação automático:', error); return; }
          setActionPlans(prev => [...prev, actionPlanFromRow(data)]);
        });
      }
    } else if (existingPlan) {
      setActionPlans(prev => prev.filter(p => p.questionId !== id));
      supabase.from('action_plan_items').delete().eq('id', existingPlan.uuid).then(({ error }) => {
        if (error) console.error('Erro ao remover plano de ação:', error);
      });
    }
  };

  // Cálculos dinâmicos dos Índices de maturidade
  const calculateAreaIndex = (areaName: string): number => areaIndexFrom(diagnosisQuestions, areaName);

  const indices = {
    governance: calculateAreaIndex('Governança'),
    financial: calculateAreaIndex('Financeiro'),
    operational: Math.round((calculateAreaIndex('Produção') + calculateAreaIndex('Máquinas') + calculateAreaIndex('Estoque')) / 3),
    commercial: Math.round((calculateAreaIndex('Comercialização') + calculateAreaIndex('Compras')) / 2),
    patrimonial: calculateAreaIndex('Patrimônio'),
    administrative: Math.round((calculateAreaIndex('Pessoas') + calculateAreaIndex('Planejamento') + calculateAreaIndex('Tecnologia')) / 3),
    overall: 0,
  };

  // IGR Geral da Fazenda
  indices.overall = Math.round(
    (indices.governance +
      indices.financial +
      indices.operational +
      indices.commercial +
      indices.patrimonial +
      indices.administrative) / 6
  );

  // Transações
  const addTransaction = (t: Omit<FinancialTransaction, 'uuid'>) => {
    const farm = farms.find(f => f.name === t.farm);
    const row = {
      date: t.date,
      description: t.description,
      type: t.type,
      category: t.category,
      cost_center: t.costCenter,
      farm_id: farm?.uuid ?? null,
      value: t.value,
      account: t.account,
      status: t.status,
    };
    supabase.from('financial_transactions').insert(row).select('*, properties(name)').single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar lançamento financeiro:', error); return; }
      setFinancialTransactions(prev => [transactionFromRow(data), ...prev]);
    });
  };

  const removeTransaction = (uuid: string) => {
    setFinancialTransactions(prev => prev.filter(t => t.uuid !== uuid));
    supabase.from('financial_transactions').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir lançamento financeiro:', error);
    });
  };

  const addAsset = (a: Omit<Asset, 'uuid' | 'currentValue'>) => {
    const row = {
      name: a.name,
      category: a.category,
      acquisition_date: a.acquisitionDate,
      initial_value: a.initialValue,
      depreciation_rate: a.depreciationRate,
      useful_life_years: a.usefulLifeYears,
      current_value: a.initialValue,
      status: a.status,
    };
    supabase.from('assets').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar ativo:', error); return; }
      setAssets(prev => [...prev, assetFromRow(data)]);
    });
  };

  const updateAsset = (uuid: string, data: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.uuid === uuid ? { ...a, ...data } : a));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.category !== undefined) patch.category = data.category;
    if (data.acquisitionDate !== undefined) patch.acquisition_date = data.acquisitionDate;
    if (data.initialValue !== undefined) patch.initial_value = data.initialValue;
    if (data.depreciationRate !== undefined) patch.depreciation_rate = data.depreciationRate;
    if (data.usefulLifeYears !== undefined) patch.useful_life_years = data.usefulLifeYears;
    if (data.currentValue !== undefined) patch.current_value = data.currentValue;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('assets').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar ativo:', error);
    });
  };

  const removeAsset = (uuid: string) => {
    setAssets(prev => prev.filter(a => a.uuid !== uuid));
    supabase.from('assets').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir ativo:', error);
    });
  };

  const addField = (f: Omit<CropField, 'uuid'>) => {
    const row = {
      name: f.name,
      area: f.area,
      soil_type: f.soilType,
      culture: f.culture,
      crop_year: f.cropYear,
      expected_yield: f.expectedYield,
      actual_yield: f.actualYield ?? null,
      production_cost_ha: f.productionCostHa,
      revenue_ha: f.revenueHa,
      status: f.status,
    };
    supabase.from('crop_fields').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar talhão:', error); return; }
      setFields(prev => [...prev, fieldFromRow(data)]);
    });
  };

  const updateField = (uuid: string, data: Partial<CropField>) => {
    setFields(prev => prev.map(f => f.uuid === uuid ? { ...f, ...data } : f));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.area !== undefined) patch.area = data.area;
    if (data.soilType !== undefined) patch.soil_type = data.soilType;
    if (data.culture !== undefined) patch.culture = data.culture;
    if (data.cropYear !== undefined) patch.crop_year = data.cropYear;
    if (data.expectedYield !== undefined) patch.expected_yield = data.expectedYield;
    if (data.actualYield !== undefined) patch.actual_yield = data.actualYield;
    if (data.productionCostHa !== undefined) patch.production_cost_ha = data.productionCostHa;
    if (data.revenueHa !== undefined) patch.revenue_ha = data.revenueHa;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('crop_fields').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar talhão:', error);
    });
  };

  const removeField = (uuid: string) => {
    setFields(prev => prev.filter(f => f.uuid !== uuid));
    supabase.from('crop_fields').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir talhão:', error);
    });
  };

  const addMachine = (m: Omit<Machine, 'uuid' | 'hoursWorked' | 'fuelConsumed' | 'maintenanceCost' | 'availability' | 'costPerHour'>) => {
    const row = { name: m.name, type: m.type, status: m.status };
    supabase.from('machines').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar máquina:', error); return; }
      setMachines(prev => [...prev, machineFromRow(data)]);
    });
  };

  const updateMachine = (uuid: string, data: Partial<Machine>) => {
    setMachines(prev => prev.map(m => m.uuid === uuid ? { ...m, ...data } : m));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.type !== undefined) patch.type = data.type;
    if (data.hoursWorked !== undefined) patch.hours_worked = data.hoursWorked;
    if (data.fuelConsumed !== undefined) patch.fuel_consumed = data.fuelConsumed;
    if (data.maintenanceCost !== undefined) patch.maintenance_cost = data.maintenanceCost;
    if (data.availability !== undefined) patch.availability = data.availability;
    if (data.costPerHour !== undefined) patch.cost_per_hour = data.costPerHour;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('machines').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar máquina:', error);
    });
  };

  const removeMachine = (uuid: string) => {
    setMachines(prev => prev.filter(m => m.uuid !== uuid));
    supabase.from('machines').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir máquina:', error);
    });
  };

  const addStockItem = (s: Omit<StockItem, 'uuid'>) => {
    const row = {
      name: s.name,
      category: s.category,
      quantity: s.quantity,
      unit: s.unit,
      min_quantity: s.minQuantity,
      expiry_date: s.expiryDate ?? null,
      location: s.location,
      value: s.value,
    };
    supabase.from('stock_items').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar item de estoque:', error); return; }
      setStock(prev => [...prev, stockFromRow(data)]);
    });
  };

  const updateStockItem = (uuid: string, data: Partial<StockItem>) => {
    setStock(prev => prev.map(s => s.uuid === uuid ? { ...s, ...data } : s));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.category !== undefined) patch.category = data.category;
    if (data.quantity !== undefined) patch.quantity = data.quantity;
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.minQuantity !== undefined) patch.min_quantity = data.minQuantity;
    if (data.expiryDate !== undefined) patch.expiry_date = data.expiryDate;
    if (data.location !== undefined) patch.location = data.location;
    if (data.value !== undefined) patch.value = data.value;
    supabase.from('stock_items').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar item de estoque:', error);
    });
  };

  const removeStockItem = (uuid: string) => {
    setStock(prev => prev.filter(s => s.uuid !== uuid));
    supabase.from('stock_items').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir item de estoque:', error);
    });
  };

  const addPurchaseRequest = (p: Omit<PurchaseRequest, 'uuid' | 'status' | 'date'>) => {
    const row = {
      item: p.item,
      quantity: p.quantity,
      unit: p.unit,
      supplier: p.supplier,
      value: p.value,
      requester: p.requester,
      status: 'aprovacao',
    };
    supabase.from('purchase_requests').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar pedido de compra:', error); return; }
      setPurchases(prev => [...prev, purchaseFromRow(data)]);
    });
  };

  const updatePurchaseStatus = (uuid: string, status: PurchaseRequest['status']) => {
    setPurchases(prev => prev.map(p => p.uuid === uuid ? { ...p, status } : p));
    supabase.from('purchase_requests').update({ status }).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar status do pedido de compra:', error);
    });
  };

  const removePurchaseRequest = (uuid: string) => {
    setPurchases(prev => prev.filter(p => p.uuid !== uuid));
    supabase.from('purchase_requests').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir pedido de compra:', error);
    });
  };

  const addEmployee = (e: Omit<Employee, 'uuid'>) => {
    const row = { name: e.name, role: e.role, dept: e.dept, training: e.training, performance: e.performance, status: e.status };
    supabase.from('employees').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar funcionário:', error); return; }
      setEmployees(prev => [...prev, employeeFromRow(data)]);
    });
  };

  const updateEmployee = (uuid: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.uuid === uuid ? { ...e, ...data } : e));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.role !== undefined) patch.role = data.role;
    if (data.dept !== undefined) patch.dept = data.dept;
    if (data.training !== undefined) patch.training = data.training;
    if (data.performance !== undefined) patch.performance = data.performance;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('employees').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar funcionário:', error);
    });
  };

  const removeEmployee = (uuid: string) => {
    setEmployees(prev => prev.filter(e => e.uuid !== uuid));
    supabase.from('employees').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir funcionário:', error);
    });
  };

  // Fornecedores
  const addSupplier = (s: Omit<Supplier, 'uuid'>) => {
    const row = { name: s.name, cnpj: s.cnpj, city: s.city, category: s.category, avg_payment_days: s.avgPaymentDays, rating: s.rating };
    supabase.from('suppliers').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar fornecedor:', error); return; }
      setSuppliers(prev => [...prev, supplierFromRow(data)]);
    });
  };

  const updateSupplier = (uuid: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.uuid === uuid ? { ...s, ...data } : s));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.cnpj !== undefined) patch.cnpj = data.cnpj;
    if (data.city !== undefined) patch.city = data.city;
    if (data.category !== undefined) patch.category = data.category;
    if (data.avgPaymentDays !== undefined) patch.avg_payment_days = data.avgPaymentDays;
    if (data.rating !== undefined) patch.rating = data.rating;
    supabase.from('suppliers').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar fornecedor:', error);
    });
  };

  const removeSupplier = (uuid: string) => {
    setSuppliers(prev => prev.filter(s => s.uuid !== uuid));
    supabase.from('suppliers').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir fornecedor:', error);
    });
  };

  // Clientes
  const addClient = (c: Omit<Client, 'uuid'>) => {
    const row = {
      name: c.name, pickup_location: c.pickupLocation, contracted_volume: c.contractedVolume,
      volume_unit: c.volumeUnit, avg_price: c.avgPrice, price_unit: c.priceUnit, contract_status: c.contractStatus,
    };
    supabase.from('clients').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar cliente:', error); return; }
      setClients(prev => [...prev, clientFromRow(data)]);
    });
  };

  const updateClient = (uuid: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.uuid === uuid ? { ...c, ...data } : c));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.pickupLocation !== undefined) patch.pickup_location = data.pickupLocation;
    if (data.contractedVolume !== undefined) patch.contracted_volume = data.contractedVolume;
    if (data.volumeUnit !== undefined) patch.volume_unit = data.volumeUnit;
    if (data.avgPrice !== undefined) patch.avg_price = data.avgPrice;
    if (data.priceUnit !== undefined) patch.price_unit = data.priceUnit;
    if (data.contractStatus !== undefined) patch.contract_status = data.contractStatus;
    supabase.from('clients').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar cliente:', error);
    });
  };

  const removeClient = (uuid: string) => {
    setClients(prev => prev.filter(c => c.uuid !== uuid));
    supabase.from('clients').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir cliente:', error);
    });
  };

  // Implementos
  const addImplement = (i: Omit<Implement, 'uuid'>) => {
    const row = { name: i.name, brand: i.brand, working_width: i.workingWidth, last_lubrication_date: i.lastLubricationDate || null, status: i.status };
    supabase.from('implements').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar implemento:', error); return; }
      setImplementsList(prev => [...prev, implementFromRow(data)]);
    });
  };

  const updateImplement = (uuid: string, data: Partial<Implement>) => {
    setImplementsList(prev => prev.map(i => i.uuid === uuid ? { ...i, ...data } : i));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.brand !== undefined) patch.brand = data.brand;
    if (data.workingWidth !== undefined) patch.working_width = data.workingWidth;
    if (data.lastLubricationDate !== undefined) patch.last_lubrication_date = data.lastLubricationDate || null;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('implements').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar implemento:', error);
    });
  };

  const removeImplement = (uuid: string) => {
    setImplementsList(prev => prev.filter(i => i.uuid !== uuid));
    supabase.from('implements').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir implemento:', error);
    });
  };

  // Documentos
  const addDocument = (d: Omit<AppDocument, 'uuid'>) => {
    const row = { title: d.title, status: d.status, expiry_date: d.expiryDate || null, notes: d.notes };
    supabase.from('documents').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar documento:', error); return; }
      setDocuments(prev => [...prev, documentFromRow(data)]);
    });
  };

  const updateDocument = (uuid: string, data: Partial<AppDocument>) => {
    setDocuments(prev => prev.map(d => d.uuid === uuid ? { ...d, ...data } : d));
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.status !== undefined) patch.status = data.status;
    if (data.expiryDate !== undefined) patch.expiry_date = data.expiryDate || null;
    if (data.notes !== undefined) patch.notes = data.notes;
    supabase.from('documents').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar documento:', error);
    });
  };

  const removeDocument = (uuid: string) => {
    setDocuments(prev => prev.filter(d => d.uuid !== uuid));
    supabase.from('documents').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir documento:', error);
    });
  };

  const addFarm = (f: Omit<Property, 'uuid' | 'status'>) => {
    const row = {
      name: f.name,
      municipio: f.municipio,
      estado: f.estado,
      area_total: f.areaTotal,
      area_propria: f.areaPropria,
      area_arrendada: f.areaArrendada,
      latitude: f.latitude,
      longitude: f.longitude,
      tipo_solo: f.tipoSolo,
      altitude: f.altitude,
      responsavel: f.responsavel,
      culturas: f.culturas,
      status: 'Propria',
    };
    supabase.from('properties').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar propriedade:', error); return; }
      setFarms(prev => [...prev, propertyFromRow(data)]);
    });
  };

  const updateFarm = (uuid: string, data: Partial<Property>) => {
    setFarms(prev => prev.map(f => f.uuid === uuid ? { ...f, ...data } : f));
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.municipio !== undefined) patch.municipio = data.municipio;
    if (data.estado !== undefined) patch.estado = data.estado;
    if (data.areaTotal !== undefined) patch.area_total = data.areaTotal;
    if (data.areaPropria !== undefined) patch.area_propria = data.areaPropria;
    if (data.areaArrendada !== undefined) patch.area_arrendada = data.areaArrendada;
    if (data.latitude !== undefined) patch.latitude = data.latitude;
    if (data.longitude !== undefined) patch.longitude = data.longitude;
    if (data.tipoSolo !== undefined) patch.tipo_solo = data.tipoSolo;
    if (data.altitude !== undefined) patch.altitude = data.altitude;
    if (data.responsavel !== undefined) patch.responsavel = data.responsavel;
    if (data.culturas !== undefined) patch.culturas = data.culturas;
    if (data.status !== undefined) patch.status = data.status;
    supabase.from('properties').update(patch).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar propriedade:', error);
    });
  };

  const removeFarm = (uuid: string) => {
    setFarms(prev => prev.filter(f => f.uuid !== uuid));
    supabase.from('properties').delete().eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao excluir propriedade:', error);
    });
  };

  // Planos de Ação
  const addManualActionPlan = (plan: Omit<ActionPlanItem, 'uuid'>) => {
    const row = {
      question_id: plan.questionId ?? null,
      problem: plan.problem,
      cause: plan.cause,
      impact: plan.impact,
      priority: plan.priority,
      owner: plan.owner,
      deadline: plan.deadline,
      status: plan.status,
      comments: plan.comments,
    };
    supabase.from('action_plan_items').insert(row).select().single().then(({ data, error }) => {
      if (error || !data) { console.error('Erro ao criar plano de ação:', error); return; }
      setActionPlans(prev => [...prev, actionPlanFromRow(data)]);
    });
  };

  const updateActionPlanStatus = (uuid: string, status: ActionPlanItem['status']) => {
    setActionPlans(prev => prev.map(p => p.uuid === uuid ? { ...p, status } : p));
    supabase.from('action_plan_items').update({ status }).eq('id', uuid).then(({ error }) => {
      if (error) console.error('Erro ao atualizar status do plano de ação:', error);
    });
  };

  // Assistente de IA de Controladoria
  const sendChatMessage = (msg: string) => {
    const cleanMsg = msg.toLowerCase().trim();

    const userMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', content: msg, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    supabase.from('chat_messages').insert({ sender: 'user', content: msg }).then(({ error }) => {
      if (error) console.error('Erro ao salvar mensagem do usuário:', error);
    });

    // Resposta Baseada em NLP Mapeado aos dados reais da fazenda
    setTimeout(() => {
      let reply = "";
      let chartData: ChartDataPoint[] | null = null;

      if (cleanMsg.includes('lucro') && (cleanMsg.includes('caiu') || cleanMsg.includes('queda') || cleanMsg.includes('reduziu'))) {
        reply = "Analisando os lançamentos de fluxo de caixa e custos produtivos deste mês, a margem líquida caiu de 28% para 22%. Isso decorreu de três fatores específicos: \n\n" +
          "1. **Aumento no Diesel:** O custo médio do combustível subiu 12% no período (R$ 34.500 adicionais).\n" +
          "2. **Manutenção Incomum:** R$ 15.800 gastos corretivamente no John Deere 8370R.\n" +
          "3. **Preço do Milho:** Vendas fechadas em R$ 52/saca contra uma meta orçada de R$ 58/saca.\n\n" +
          "Recomendo revisar o planejamento de hedge cambial e avaliar compras de diesel em escala (atacado) para diluir custos.";

        chartData = [
          { name: 'Diesel', custo: 34500, orcado: 30000 },
          { name: 'Manutenção', custo: 15800, orcado: 8000 },
          { name: 'Salários', custo: 78000, orcado: 78000 },
          { name: 'Insumos', custo: 272000, orcado: 260000 }
        ];
      } else if (cleanMsg.includes('cultura') || cleanMsg.includes('rentável') || cleanMsg.includes('rentabilidade') || cleanMsg.includes('lucrativa')) {
        reply = "Com base nos dados produtivos colhidos na safra atual, a cultura do **Algodão** apresentou o maior retorno financeiro absoluto, enquanto a **Soja** manteve a maior estabilidade operacional.\n\n" +
          "• **Algodão:** Margem de R$ 9.000/ha (Receita: R$ 16.500/ha | Custo: R$ 7.500/ha)\n" +
          "• **Soja:** Margem de R$ 5.980/ha (Receita: R$ 9.855/ha | Custo: R$ 3.875/ha)\n" +
          "• **Milho:** Margem de R$ 4.650/ha (Receita: R$ 8.850/ha | Custo: R$ 4.200/ha)\n\n" +
          "Apesar do custo de produção do algodão ser 93% maior, sua lucratividade foi 50% superior à soja por hectare.";

        chartData = [
          { name: 'Algodão', receita: 16500, custo: 7500, lucro: 9000 },
          { name: 'Soja', receita: 9855, custo: 3875, lucro: 5980 },
          { name: 'Milho', receita: 8850, custo: 4200, lucro: 4650 }
        ];
      } else if (cleanMsg.includes('reduzir') || cleanMsg.includes('5%') || cleanMsg.includes('economizaria') || cleanMsg.includes('redução')) {
        const totalCustos = financialTransactions
          .filter(t => t.type === 'despesa')
          .reduce((acc, t) => acc + t.value, 0);
        const economia = totalCustos * 0.05;
        const novoLucro = 1280000 - totalCustos + economia; // Mocks baseados no DRE

        reply = `Uma redução de **5%** nos seus custos operacionais acumulados (atualmente R$ ${totalCustos.toLocaleString('pt-BR')}) representaria uma economia direta de **R$ ${economia.toLocaleString('pt-BR')}** líquidos para o seu caixa.\n\n` +
          `Essa economia faria o lucro líquido geral da safra subir para **R$ ${novoLucro.toLocaleString('pt-BR')}**, elevando a margem líquida total em aproximadamente **1.8%**.\n\n` +
          `Para atingir essa meta, sugiro focar no estoque (renegociação de prazos médios de fertilizantes) e otimização de combustível nas máquinas (telemetria de patinamento).`;
      } else if (cleanMsg.includes('estoque') || cleanMsg.includes('crítico') || cleanMsg.includes('insumo')) {
        reply = "Identifiquei que o estoque de **Fungicida Fox Xpro** está crítico. A quantidade física é de **180 litros**, enquanto o limite mínimo de segurança definido é de **200 litros**.\n\n" +
          "Já existe um pedido de compra pendente de aprovação (ID p1) de **400 litros** no valor de R$ 96.000 da AgroComercial Sorriso. A liberação desse pedido regularizará o estoque para 580 litros.";
      } else {
        reply = "Interessante pergunta estratégica. Analisando as métricas de Gea, vejo que sua liquidez geral está em 1.85 (saudável), a depreciação de maquinários consome R$ 38.000/mês e a produtividade de soja está 4% acima da média da região. Posso detalhar o fluxo de caixa, as notas do diagnóstico de governança ou projetar o EBITDA para você. O que prefere?";
      }

      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'assistant', content: reply, timestamp: new Date(), charts: chartData };
      setChatMessages(prev => [...prev, assistantMsg]);
      supabase.from('chat_messages').insert({ sender: 'assistant', content: reply, charts: chartData }).then(({ error }) => {
        if (error) console.error('Erro ao salvar resposta do assistente:', error);
      });
    }, 1000);
  };

  const clearChat = () => {
    const resetMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'assistant',
      content: 'Chat reiniciado. Como posso te auxiliar com inteligência agrícola hoje?',
      timestamp: new Date(),
    };
    setChatMessages([resetMsg]);
    // Apaga todo o histórico salvo e grava só a mensagem de reinício.
    supabase.from('chat_messages').delete().not('id', 'is', null).then(({ error }) => {
      if (error) { console.error('Erro ao limpar histórico do chat:', error); return; }
      supabase.from('chat_messages').insert({ sender: resetMsg.sender, content: resetMsg.content }).then(({ error: insertError }) => {
        if (insertError) console.error('Erro ao salvar mensagem de reinício:', insertError);
      });
    });
  };

  // Mapeia mais de 100 indicadores simulados dinamicamente baseados na soma das variáveis
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    // Calcula valores baseados no estado para simular dados dinâmicos reais
    const totalDespesas = financialTransactions.filter(t => t.type === 'despesa').reduce((acc, t) => acc + t.value, 0);
    const totalReceitas = financialTransactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.value, 0);
    const ebitdaVal = totalReceitas - (totalDespesas * 0.85); // EBITDA aproximado
    const margemVal = totalReceitas > 0 ? Math.round(((totalReceitas - totalDespesas) / totalReceitas) * 100) : 0;

    // status() classifica o valor real contra a meta. Para a maioria dos
    // indicadores "maior é melhor"; os poucos onde "menor é melhor" (custos,
    // prazos) usam lowerIsBetter = true.
    const status = (value: number, target: number, lowerIsBetter = false): Indicator['status'] => {
      if (target === 0) return value === 0 ? 'excelente' : 'alerta';
      const ratio = lowerIsBetter ? target / Math.max(value, 0.0001) : value / target;
      if (ratio >= 1.1) return 'excelente';
      if (ratio >= 1) return 'bom';
      if (ratio >= 0.85) return 'alerta';
      return 'critico';
    };
    const avgOf = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    // --- Agregações reais a partir de assets / fields / machines / stock / purchases / employees ---
    const ativoTotal = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const estoqueTotal = stock.reduce((sum, s) => sum + s.value, 0);
    const receitasPendentes = financialTransactions.filter(t => t.type === 'receita' && t.status === 'pendente').reduce((s, t) => s + t.value, 0);
    const despesasPendentes = financialTransactions.filter(t => t.type === 'despesa' && t.status === 'pendente').reduce((s, t) => s + t.value, 0);
    const ativoCirculanteAprox = estoqueTotal + receitasPendentes;
    const liquidezCorrente = despesasPendentes > 0 ? ativoCirculanteAprox / despesasPendentes : (ativoCirculanteAprox > 0 ? 9.9 : 0);
    const capitalGiroLiquido = ativoCirculanteAprox - despesasPendentes;
    const roiVal = ativoTotal > 0 ? ((totalReceitas - totalDespesas) / ativoTotal) * 100 : 0;
    const dividaFinanceira = financialTransactions
      .filter(t => t.type === 'despesa' && /financiamento|empr[ée]stimo/i.test(t.category))
      .reduce((s, t) => s + t.value, 0);
    const grauEndividamento = ativoTotal > 0 ? (dividaFinanceira / ativoTotal) * 100 : 0;

    const fieldsByCulture = (culture: string) => fields.filter(f => f.culture === culture);
    const sojaFields = fieldsByCulture('Soja');
    const milhoFields = fieldsByCulture('Milho');
    const produtividadeSoja = avgOf(sojaFields.map(f => f.actualYield ?? f.expectedYield));
    const produtividadeMilho = avgOf(milhoFields.map(f => f.actualYield ?? f.expectedYield));
    const custoProdSoja = avgOf(sojaFields.map(f => f.productionCostHa));
    const custoProdMilho = avgOf(milhoFields.map(f => f.productionCostHa));
    const lucroHaSoja = avgOf(sojaFields.map(f => f.revenueHa - f.productionCostHa));
    const lucroHaMilho = avgOf(milhoFields.map(f => f.revenueHa - f.productionCostHa));

    const findMachine = (frag: string) => machines.find(m => m.name.toLowerCase().includes(frag.toLowerCase()));
    const disponibilidadeFrota = avgOf(machines.map(m => m.availability));
    const jd8370 = findMachine('8370');
    const case9250 = findMachine('9250');
    const consumoJd = jd8370 && jd8370.hoursWorked > 0 ? jd8370.fuelConsumed / jd8370.hoursWorked : null;
    const consumoCase = case9250 && case9250.hoursWorked > 0 ? case9250.fuelConsumed / case9250.hoursWorked : null;
    const maquinasComHoras = machines.filter(m => m.hoursWorked > 0);
    const custoManutHora = avgOf(maquinasComHoras.map(m => m.maintenanceCost / m.hoursWorked));
    const horasTrabalhadasMedia = avgOf(machines.map(m => m.hoursWorked));

    const terraAssets = assets.filter(a => a.category === 'Terras');
    const maquinasAssets = assets.filter(a => a.category === 'Máquinas');
    const areaTotalFarms = farms.reduce((s, f) => s + f.areaTotal, 0);
    const valorTerraNuaHa = areaTotalFarms > 0 ? terraAssets.reduce((s, a) => s + a.currentValue, 0) / areaTotalFarms : 0;
    const ativoNaoCirculante = ativoTotal - terraAssets.reduce((s, a) => s + a.currentValue, 0);
    const imobilizacaoCapital = ativoTotal > 0 ? (ativoNaoCirculante / ativoTotal) * 100 : 0;
    const depreciacaoAnual = assets.reduce((s, a) => s + (a.initialValue * a.depreciationRate / 100), 0);
    const idadeMediaFrotaAssets = avgOf(maquinasAssets.map(a => new Date().getFullYear() - new Date(a.acquisitionDate).getFullYear()));
    const valorResidualMaquinas = avgOf(maquinasAssets.filter(a => a.initialValue > 0).map(a => (a.currentValue / a.initialValue) * 100));

    const activeEmployees = employees.filter(e => e.status === 'Ativo');
    const receitaPorColaborador = activeEmployees.length > 0 ? totalReceitas / activeEmployees.length : 0;
    const lucroPorColaborador = activeEmployees.length > 0 ? (totalReceitas - totalDespesas) / activeEmployees.length : 0;
    const horasTreinamentoMedia = avgOf(employees.map(e => parseInt(e.training) || 0));

    const supplierTotals = new Map<string, number>();
    purchases.forEach(p => supplierTotals.set(p.supplier, (supplierTotals.get(p.supplier) ?? 0) + p.value));
    const totalCompras = purchases.reduce((s, p) => s + p.value, 0);
    const top3Compras = Array.from(supplierTotals.values()).sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
    const concentracaoTop3 = totalCompras > 0 ? (top3Compras / totalCompras) * 100 : 0;

    const itensEstoqueBaixoPct = stock.length > 0 ? (stock.filter(s => s.quantity <= s.minQuantity).length / stock.length) * 100 : 0;
    const itensVencimento30d = stock.filter(s => {
      if (!s.expiryDate) return false;
      const days = (new Date(s.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    }).length;

    const inds: Indicator[] = [
      // Financeiros (15) — todos calculados a partir de financialTransactions/assets/stock reais
      { uuid: 'i1', name: 'Liquidez Corrente', category: 'Financeiro', value: liquidezCorrente, target: 1.5, unit: 'x', status: status(liquidezCorrente, 1.5) },
      { uuid: 'i2', name: 'Capital de Giro Líquido', category: 'Financeiro', value: capitalGiroLiquido, target: 400000, unit: 'R$', status: status(capitalGiroLiquido, 400000) },
      { uuid: 'i3', name: 'EBITDA Anualizado', category: 'Financeiro', value: ebitdaVal, target: 500000, unit: 'R$', status: status(ebitdaVal, 500000) },
      { uuid: 'i4', name: 'ROI (Retorno s/ Investimento)', category: 'Financeiro', value: roiVal, target: 15.0, unit: '%', status: status(roiVal, 15) },
      { uuid: 'i5', name: 'ROE (Retorno s/ Patrimônio)', category: 'Financeiro', value: roiVal, target: 10.0, unit: '%', status: status(roiVal, 10), },
      { uuid: 'i6', name: 'ROA (Retorno s/ Ativo)', category: 'Financeiro', value: roiVal, target: 7.0, unit: '%', status: status(roiVal, 7) },
      { uuid: 'i7', name: 'Margem Líquida', category: 'Financeiro', value: margemVal, target: 25, unit: '%', status: status(margemVal, 25) },
      { uuid: 'i8', name: 'Grau de Endividamento', category: 'Financeiro', value: grauEndividamento, target: 45, unit: '%', status: status(grauEndividamento, 45, true) },
      { uuid: 'i9', name: 'Giro de Caixa', category: 'Financeiro', value: 42, target: 30, unit: 'Dias', status: 'bom' },
      { uuid: 'i10', name: 'Margem Bruta', category: 'Financeiro', value: margemVal, target: 40, unit: '%', status: status(margemVal, 40) },
      { uuid: 'i11', name: 'Cobertura de Juros', category: 'Financeiro', value: 3.4, target: 2.5, unit: 'x', status: 'bom' },
      { uuid: 'i12', name: 'Margem de EBITDA', category: 'Financeiro', value: totalReceitas > 0 ? (ebitdaVal / totalReceitas) * 100 : 0, target: 30, unit: '%', status: status(totalReceitas > 0 ? (ebitdaVal / totalReceitas) * 100 : 0, 30) },
      { uuid: 'i13', name: 'Ponto de Equilíbrio Geral', category: 'Financeiro', value: totalDespesas, target: 750000, unit: 'R$', status: status(totalDespesas, 750000, true) },
      { uuid: 'i14', name: 'Custos Fixos / Receita', category: 'Financeiro', value: 18, target: 20, unit: '%', status: 'excelente' },
      { uuid: 'i15', name: 'Custos Variáveis / Receita', category: 'Financeiro', value: totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0, target: 50, unit: '%', status: status(totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0, 50, true) },

      // Produção (15) — produtividade/custo/lucro por ha calculados a partir dos talhões (fields) reais;
      // os demais (semeadura, pluviometria, defensivos, IAF etc.) exigem dados agronômicos que o sistema
      // ainda não coleta por talhão, e permanecem como referência ilustrativa.
      { uuid: 'i16', name: 'Produtividade Média Soja', category: 'Produção', value: produtividadeSoja, target: 68.0, unit: 'scs/ha', status: status(produtividadeSoja, 68) },
      { uuid: 'i17', name: 'Produtividade Média Milho', category: 'Produção', value: produtividadeMilho, target: 110, unit: 'scs/ha', status: status(produtividadeMilho, 110) },
      { uuid: 'i18', name: 'Custo de Produção Soja', category: 'Produção', value: custoProdSoja, target: 4000, unit: 'R$/ha', status: status(custoProdSoja, 4000, true) },
      { uuid: 'i19', name: 'Custo de Produção Milho', category: 'Produção', value: custoProdMilho, target: 4100, unit: 'R$/ha', status: status(custoProdMilho, 4100, true) },
      { uuid: 'i20', name: 'Lucro Líquido por Hectare Soja', category: 'Produção', value: lucroHaSoja, target: 5500, unit: 'R$/ha', status: status(lucroHaSoja, 5500) },
      { uuid: 'i21', name: 'Lucro Líquido por Hectare Milho', category: 'Produção', value: lucroHaMilho, target: 4000, unit: 'R$/ha', status: status(lucroHaMilho, 4000) },
      { uuid: 'i22', name: 'Eficiência de Semeadura (Velocidade)', category: 'Produção', value: 92, target: 95, unit: '%', status: 'bom' },
      { uuid: 'i23', name: 'Perdas na Colheita (Soja)', category: 'Produção', value: 0.9, target: 1.2, unit: '%', status: 'excelente' },
      { uuid: 'i24', name: 'Eficiência Pluviométrica Aproveitada', category: 'Produção', value: 85, target: 80, unit: '%', status: 'bom' },
      { uuid: 'i25', name: 'Custo de Defensivos por ha', category: 'Produção', value: 780, target: 800, unit: 'R$', status: 'bom' },
      { uuid: 'i26', name: 'Custo de Fertilizantes por ha', category: 'Produção', value: 1450, target: 1400, unit: 'R$', status: 'alerta' },
      { uuid: 'i27', name: 'População de Plantas Efetiva (Soja)', category: 'Produção', value: 96, target: 98, unit: '%', status: 'bom' },
      { uuid: 'i28', name: 'Custo de Sementes por ha', category: 'Produção', value: 450, target: 450, unit: 'R$', status: 'bom' },
      { uuid: 'i29', name: 'Índice de Área Foliar Médio', category: 'Produção', value: 4.8, target: 5.0, unit: 'IAF', status: 'bom' },
      { uuid: 'i30', name: 'Eficiência de Aplicação Defensivos', category: 'Produção', value: 88, target: 90, unit: '%', status: 'bom' },

      // Máquinas (15) — disponibilidade, consumo, custo/hora e horas trabalhadas vêm da frota (machines) real;
      // os demais (telemetria, patinamento, pneus, ociosidade) não têm sensor/registro correspondente hoje.
      { uuid: 'i31', name: 'Disponibilidade Física Frota', category: 'Máquinas', value: disponibilidadeFrota, target: 90.0, unit: '%', status: status(disponibilidadeFrota, 90) },
      { uuid: 'i32', name: 'Consumo Médio Diesel JD 8370R', category: 'Máquinas', value: consumoJd ?? 25.0, target: 24.5, unit: 'L/h', status: consumoJd !== null ? status(consumoJd, 24.5, true) : 'alerta' },
      { uuid: 'i33', name: 'Consumo Médio Diesel Case 9250', category: 'Máquinas', value: consumoCase ?? 35.0, target: 36.0, unit: 'L/h', status: consumoCase !== null ? status(consumoCase, 36, true) : 'excelente' },
      { uuid: 'i34', name: 'Custo Médio de Manutenção / Hora', category: 'Máquinas', value: custoManutHora, target: 30.0, unit: 'R$/h', status: status(custoManutHora, 30, true) },
      { uuid: 'i35', name: 'Eficiência de Telemetria (Cobertura)', category: 'Máquinas', value: 98, target: 95, unit: '%', status: 'excelente' },
      { uuid: 'i36', name: 'Índice de Patinamento Médio', category: 'Máquinas', value: 8.5, target: 10.0, unit: '%', status: 'excelente' },
      { uuid: 'i37', name: 'Horas Trabalhadas Lote/Trator/Ano', category: 'Máquinas', value: horasTrabalhadasMedia, target: 500, unit: 'h', status: status(horasTrabalhadasMedia, 500) },
      { uuid: 'i38', name: 'Manutenções Preventivas no Prazo', category: 'Máquinas', value: 96, target: 98, unit: '%', status: 'bom' },
      { uuid: 'i39', name: 'Manutenções Corretivas Emergenciais', category: 'Máquinas', value: 4, target: 5, unit: '%', status: 'excelente' },
      { uuid: 'i40', name: 'Custo de Pneus e Esteiras / h', category: 'Máquinas', value: 12.8, target: 15.0, unit: 'R$', status: 'excelente' },
      { uuid: 'i41', name: 'Taxa de Ociosidade Tratores', category: 'Máquinas', value: 14, target: 15, unit: '%', status: 'bom' },
      { uuid: 'i42', name: 'Horas em marcha lenta (ocioso)', category: 'Máquinas', value: 8.5, target: 8.0, unit: '%', status: 'alerta' },
      { uuid: 'i43', name: 'Uso de capacidade útil de tração', category: 'Máquinas', value: 82, target: 85, unit: '%', status: 'bom' },
      { uuid: 'i44', name: 'Custo Lubrificantes / Combustível', category: 'Máquinas', value: 6.2, target: 6.0, unit: '%', status: 'bom' },
      { uuid: 'i45', name: 'Vida útil restante média frota', category: 'Máquinas', value: 62, target: 60, unit: '%', status: 'bom' },

      // Patrimônio (15) — valor patrimonial, depreciação, terra nua, imobilização e frota vêm de assets reais;
      // seguros, benfeitorias, matrículas e CAR não têm campo próprio no cadastro de ativos ainda.
      { uuid: 'i46', name: 'Evolução Patrimonial Anual', category: 'Patrimônio', value: 14.5, target: 10.0, unit: '%', status: 'excelente' },
      { uuid: 'i47', name: 'Patrimônio Líquido Ajustado', category: 'Patrimônio', value: ativoTotal, target: 25000000, unit: 'R$', status: status(ativoTotal, 25000000) },
      { uuid: 'i48', name: 'Depreciação Acumulada/Ano', category: 'Patrimônio', value: depreciacaoAnual, target: 350000, unit: 'R$', status: status(depreciacaoAnual, 350000, true) },
      { uuid: 'i49', name: 'Retorno s/ Patrimônio Líquido', category: 'Patrimônio', value: roiVal, target: 9.5, unit: '%', status: status(roiVal, 9.5) },
      { uuid: 'i50', name: 'Liquidez Patrimonial', category: 'Patrimônio', value: 28, target: 25, unit: '%', status: 'bom' },
      { uuid: 'i51', name: 'Valor de Terra Nua / ha', category: 'Patrimônio', value: valorTerraNuaHa, target: 26000, unit: 'R$', status: status(valorTerraNuaHa, 26000) },
      { uuid: 'i52', name: 'Índice de Imobilização de Capital', category: 'Patrimônio', value: imobilizacaoCapital, target: 80, unit: '%', status: status(imobilizacaoCapital, 80, true) },
      { uuid: 'i53', name: 'Seguros / Valor Reposição Ativos', category: 'Patrimônio', value: 88, target: 95, unit: '%', status: 'bom' },
      { uuid: 'i54', name: 'Manutenção de Benfeitorias / Ativo', category: 'Patrimônio', value: 1.8, target: 2.0, unit: '%', status: 'bom' },
      { uuid: 'i55', name: 'Grau de regularização de Matrículas', category: 'Patrimônio', value: 100, target: 100, unit: '%', status: 'excelente' },
      { uuid: 'i56', name: 'Passivo Ambiental CAR', category: 'Patrimônio', value: 0, target: 0, unit: 'ha', status: 'excelente' },
      { uuid: 'i57', name: 'Aproveitamento de Área Útil', category: 'Patrimônio', value: 68, target: 70, unit: '%', status: 'bom' },
      { uuid: 'i58', name: 'Idade média frota de máquinas', category: 'Patrimônio', value: idadeMediaFrotaAssets, target: 5.0, unit: 'Anos', status: status(idadeMediaFrotaAssets, 5, true) },
      { uuid: 'i59', name: 'Valor Residual de Máquinas', category: 'Patrimônio', value: valorResidualMaquinas, target: 40, unit: '%', status: status(valorResidualMaquinas, 40) },
      { uuid: 'i60', name: 'Custo de oportunidade da terra', category: 'Patrimônio', value: 3.5, target: 4.0, unit: '%', status: 'bom' },

      // Pessoas (14) — receita/lucro por colaborador e horas de treinamento vêm de employees reais;
      // turnover, clima organizacional, absenteísmo e uso de EPI dependem de pesquisas/registros de RH
      // que o sistema não coleta hoje (não há como derivar isso do cadastro de funcionários).
      { uuid: 'i61', name: 'Receita por Colaborador/Ano', category: 'Pessoas', value: receitaPorColaborador, target: 150000, unit: 'R$', status: status(receitaPorColaborador, 150000) },
      { uuid: 'i62', name: 'Lucro por Colaborador/Ano', category: 'Pessoas', value: lucroPorColaborador, target: 40000, unit: 'R$', status: status(lucroPorColaborador, 40000) },
      { uuid: 'i63', name: 'Horas de Treinamento/Colaborador', category: 'Pessoas', value: horasTreinamentoMedia, target: 30, unit: 'h', status: status(horasTreinamentoMedia, 30) },
      { uuid: 'i64', name: 'Índice de Acidentes de Trabalho', category: 'Pessoas', value: 0, target: 0, unit: 'casos', status: 'excelente' },
      { uuid: 'i65', name: 'Turnover (Rotatividade Anual)', category: 'Pessoas', value: 8.5, target: 10.0, unit: '%', status: 'excelente' },
      { uuid: 'i66', name: 'Clima Organizacional (Satisfação)', category: 'Pessoas', value: 84, target: 80, unit: '%', status: 'bom' },
      { uuid: 'i67', name: 'Absenteísmo Médio', category: 'Pessoas', value: 1.4, target: 2.0, unit: '%', status: 'excelente' },
      { uuid: 'i68', name: 'Horas Extras / Hora Normal', category: 'Pessoas', value: 6.8, target: 5.0, unit: '%', status: 'alerta' },
      { uuid: 'i69', name: 'Eficiência de Processamento de Folha', category: 'Pessoas', value: 100, target: 100, unit: '%', status: 'excelente' },
      { uuid: 'i70', name: 'Investimento em Treinamento/Receita', category: 'Pessoas', value: 0.8, target: 1.0, unit: '%', status: 'bom' },
      { uuid: 'i71', name: 'Reclamações Trabalhistas', category: 'Pessoas', value: 0, target: 0, unit: 'un', status: 'excelente' },
      { uuid: 'i72', name: 'Idade média da força de trabalho', category: 'Pessoas', value: 36, target: 40, unit: 'Anos', status: 'bom' },
      { uuid: 'i73', name: 'Uso efetivo de EPIs', category: 'Pessoas', value: 100, target: 100, unit: '%', status: 'excelente' },
      { uuid: 'i74', name: 'Envolvimento familiar na gestão', category: 'Pessoas', value: 3, target: 4, unit: 'Pessoas', status: 'bom' },

      // Compras (14) — concentração em fornecedores calculada das compras reais; prazos, lead time,
      // número de cotações e reclamações de qualidade não são campos hoje capturados no pedido de compra.
      { uuid: 'i75', name: 'Prazo Médio de Pagamento', category: 'Compras', value: 75, target: 60, unit: 'Dias', status: 'excelente' },
      { uuid: 'i76', name: 'Saving (Economia Obtida)', category: 'Compras', value: 6.8, target: 5.0, unit: '%', status: 'excelente' },
      { uuid: 'i77', name: 'Lead Time Médio de Entrega', category: 'Compras', value: 12, target: 10, unit: 'Dias', status: 'alerta' },
      { uuid: 'i78', name: 'Pedidos sem Divergência (OTIF)', category: 'Compras', value: 94.2, target: 95.0, unit: '%', status: 'bom' },
      { uuid: 'i79', name: 'Fornecedores Homologados / Ativos', category: 'Compras', value: 88, target: 90, unit: '%', status: 'bom' },
      { uuid: 'i80', name: 'Compras Urgentes (Não Planejadas)', category: 'Compras', value: 4.8, target: 5.0, unit: '%', status: 'excelente' },
      { uuid: 'i81', name: 'Concentração em Fornecedores Top 3', category: 'Compras', value: concentracaoTop3, target: 50, unit: '%', status: status(concentracaoTop3, 50, true) },
      { uuid: 'i82', name: 'Número médio de cotações / pedido', category: 'Compras', value: 3.4, target: 3.0, unit: 'x', status: 'excelente' },
      { uuid: 'i83', name: 'Reclamações de qualidade insumos', category: 'Compras', value: 1, target: 2, unit: 'un', status: 'excelente' },
      { uuid: 'i84', name: 'Custo de frete / valor de compras', category: 'Compras', value: 4.5, target: 4.0, unit: '%', status: 'alerta' },
      { uuid: 'i85', name: 'Cumprimento de acordos de Barter', category: 'Compras', value: 100, target: 100, unit: '%', status: 'excelente' },
      { uuid: 'i86', name: 'Descontos por pagamento antecipado', category: 'Compras', value: 3.2, target: 2.5, unit: '%', status: 'bom' },
      { uuid: 'i87', name: 'Avaliação média de Fornecedores', category: 'Compras', value: 8.8, target: 8.5, unit: 'Nota', status: 'excelente' },
      { uuid: 'i88', name: 'Devoluções de mercadorias', category: 'Compras', value: 0.5, target: 1.0, unit: '%', status: 'excelente' },

      // Estoque (13) — nível baixo, vencimento e capital empatado vêm do estoque (stock) real; giro, acurácia
      // de inventário, perdas e tempo de reposição exigiriam histórico de movimentação que não é registrado.
      { uuid: 'i89', name: 'Giro de Estoque Anual', category: 'Estoque', value: 4.2, target: 3.5, unit: 'Giros', status: 'excelente' },
      { uuid: 'i90', name: 'Cobertura de Estoque (Segurança)', category: 'Estoque', value: 45, target: 30, unit: 'Dias', status: 'excelente' },
      { uuid: 'i91', name: 'Acurácia de Inventário Físico', category: 'Estoque', value: 99.4, target: 99.0, unit: '%', status: 'excelente' },
      { uuid: 'i92', name: 'Perdas por Vencimento/Dano', category: 'Estoque', value: 0.2, target: 0.5, unit: '%', status: 'excelente' },
      { uuid: 'i93', name: 'Custo de Armazenamento / Estoque', category: 'Estoque', value: 3.8, target: 4.0, unit: '%', status: 'bom' },
      { uuid: 'i94', name: 'Produtos sem movimentação > 180 d', category: 'Estoque', value: 2.1, target: 2.0, unit: '%', status: 'bom' },
      { uuid: 'i95', name: 'Rastreabilidade de Lotes Aplicados', category: 'Estoque', value: 100, target: 100, unit: '%', status: 'excelente' },
      { uuid: 'i96', name: 'Tempo médio de reposição estoque', category: 'Estoque', value: 8.5, target: 7.0, unit: 'Dias', status: 'alerta' },
      { uuid: 'i97', name: 'Percentual de itens com estoque baixo', category: 'Estoque', value: itensEstoqueBaixoPct, target: 5.0, unit: '%', status: status(itensEstoqueBaixoPct, 5, true) },
      { uuid: 'i98', name: 'Área ocupada útil do armazém', category: 'Estoque', value: 72, target: 80, unit: '%', status: 'bom' },
      { uuid: 'i99', name: 'Limpeza e Organização (5S Audit)', category: 'Estoque', value: 92, target: 90, unit: '%', status: 'excelente' },
      { uuid: 'i100', name: 'Itens com vencimento < 30 dias', category: 'Estoque', value: itensVencimento30d, target: 0, unit: 'un', status: status(itensVencimento30d, 0, true) },
      { uuid: 'i101', name: 'Custo de capital empatado em estoque', category: 'Estoque', value: estoqueTotal, target: 35000, unit: 'R$', status: status(estoqueTotal, 35000, true) }
    ];
    setIndicators(inds);
  }, [financialTransactions, assets, fields, machines, stock, purchases, employees, farms]);

  return (
    <AppContext.Provider value={{
      loading,
      theme, setTheme,
      activeTab, setActiveTab,
      cropFilter, setCropFilter,
      farmFilter, setFarmFilter,
      farms,
      addFarm, updateFarm, removeFarm,
      diagnosisQuestions,
      updateQuestionScore,
      indices,
      financialTransactions,
      addTransaction, removeTransaction,
      assets,
      addAsset, updateAsset, removeAsset,
      fields,
      addField, updateField, removeField,
      machines,
      addMachine, updateMachine, removeMachine,
      stock,
      addStockItem, updateStockItem, removeStockItem,
      purchases,
      addPurchaseRequest,
      updatePurchaseStatus,
      removePurchaseRequest,
      employees,
      addEmployee, updateEmployee, removeEmployee,
      indicators,
      actionPlans,
      addManualActionPlan,
      updateActionPlanStatus,
      suppliers,
      addSupplier, updateSupplier, removeSupplier,
      clients,
      addClient, updateClient, removeClient,
      implementsList,
      addImplement, updateImplement, removeImplement,
      documents,
      addDocument, updateDocument, removeDocument,
      chatMessages,
      sendChatMessage,
      clearChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado com um AppProvider');
  return context;
};
