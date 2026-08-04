// Tipos das linhas como elas existem no Postgres (snake_case), espelhando
// supabase/migrations/20260726120000_initial_schema.sql. Os tipos "de app"
// (camelCase) usados no resto do código vivem em context/AppContext.tsx;
// as funções db*ToApp/appToDb* fazem a conversão entre os dois mundos.

export interface PropertyRow {
  id: string;
  name: string;
  municipio: string;
  estado: string;
  area_total: number;
  area_propria: number;
  area_arrendada: number;
  latitude: number | null;
  longitude: number | null;
  tipo_solo: string | null;
  altitude: number | null;
  responsavel: string | null;
  culturas: string[];
  status: string;
  created_at: string;
}

export interface DiagnosisQuestionRow {
  id: number;
  area: string;
  question: string;
  score: number;
}

export interface FinancialTransactionRow {
  id: string;
  date: string;
  description: string;
  type: 'receita' | 'despesa';
  category: string;
  cost_center: string;
  farm_id: string | null;
  value: number;
  account: string;
  status: 'pago' | 'pendente';
  created_at: string;
  properties?: { name: string } | null;
}

export interface AssetRow {
  id: string;
  name: string;
  category: string;
  acquisition_date: string;
  initial_value: number;
  depreciation_rate: number;
  useful_life_years: number;
  current_value: number;
  status: string;
  created_at: string;
}

export interface CropFieldRow {
  id: string;
  name: string;
  area: number;
  soil_type: string | null;
  culture: string;
  crop_year: string;
  expected_yield: number | null;
  actual_yield: number | null;
  production_cost_ha: number | null;
  revenue_ha: number | null;
  status: string;
  boundary: [number, number][] | null;
  created_at: string;
}

export interface MachineRow {
  id: string;
  name: string;
  type: string;
  hours_worked: number;
  fuel_consumed: number;
  maintenance_cost: number;
  availability: number;
  cost_per_hour: number;
  status: string;
  created_at: string;
}

export interface StockItemRow {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  expiry_date: string | null;
  location: string | null;
  value: number;
  created_at: string;
}

export interface PurchaseRequestRow {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  supplier: string;
  value: number;
  requester: string;
  date: string;
  status: string;
  created_at: string;
}

export interface EmployeeRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  training: string | null;
  performance: string | null;
  status: string;
  created_at: string;
}

export interface ActionPlanItemRow {
  id: string;
  question_id: number | null;
  problem: string;
  cause: string | null;
  impact: string | null;
  priority: string;
  owner: string | null;
  deadline: string | null;
  status: string;
  comments: string | null;
  created_at: string;
}

export interface ChatMessageRow {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  charts: unknown;
  created_at: string;
}

export interface SupplierRow {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  category: string | null;
  avg_payment_days: number | null;
  rating: string | null;
  created_at: string;
}

export interface ClientRow {
  id: string;
  name: string;
  cnpj: string | null;
  pickup_location: string | null;
  contracted_volume: number | null;
  volume_unit: string | null;
  avg_price: number | null;
  price_unit: string | null;
  contract_status: string | null;
  created_at: string;
}

export interface ImplementRow {
  id: string;
  name: string;
  brand: string | null;
  working_width: string | null;
  last_lubrication_date: string | null;
  status: string;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  title: string;
  status: string;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface InvoiceRow {
  id: string;
  client_id: string | null;
  number: string | null;
  issue_date: string | null;
  value: number | null;
  file_path: string | null;
  file_name: string;
  access_key: string | null;
  source: string;
  issuer_name: string | null;
  issuer_doc: string | null;
  dest_name: string | null;
  dest_doc: string | null;
  created_at: string;
}

export interface SefazSyncStateRow {
  id: boolean;
  ult_nsu: string;
  last_sync_at: string | null;
  last_status: string | null;
  last_message: string | null;
}

export interface StrategicGoalRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_date: string | null;
  progress: string;
  created_at: string;
}
