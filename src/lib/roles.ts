import type { UserRole } from '../context/AuthContext';

// Nomes exibidos na interface para cada papel.
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  consultor: 'Consultor',
  produtor_rural: 'Produtor Rural',
  gestor_financeiro: 'Gestor Financeiro',
  gerente_fazenda: 'Gerente da Fazenda',
  funcionario: 'Funcionário',
  contador: 'Contador (Leitura)',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [UserRole, string][];

// Quais abas do menu lateral cada papel enxerga. Isso controla só a
// navegação/UI — o acesso aos dados no Supabase é liberado para qualquer
// usuário autenticado (ver migration 20260726180000_auth_and_profiles.sql).
// Ajuste esse mapa livremente conforme a necessidade real de cada perfil.
const FULL_ACCESS = [
  'dashboard', 'diagnosis', 'indicators', 'actionplan', 'planning',
  'properties', 'fields', 'production', 'employees',
  'assets', 'machines', 'implements',
  'stock', 'purchases', 'suppliers', 'clients',
  'cashflow', 'dre', 'balance',
  'documents', 'reports', 'settings',
];

export const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
  admin: [...FULL_ACCESS, 'users'],
  consultor: FULL_ACCESS,
  produtor_rural: FULL_ACCESS,
  gestor_financeiro: [
    'dashboard', 'indicators', 'cashflow', 'dre', 'balance',
    'purchases', 'suppliers', 'clients', 'reports', 'documents', 'settings',
  ],
  gerente_fazenda: [
    'dashboard', 'diagnosis', 'indicators', 'actionplan', 'planning',
    'properties', 'fields', 'production', 'employees',
    'assets', 'machines', 'implements',
    'stock', 'purchases', 'suppliers',
    'reports', 'documents', 'settings',
  ],
  funcionario: ['dashboard', 'production', 'fields', 'stock', 'settings'],
  contador: ['dashboard', 'cashflow', 'dre', 'balance', 'reports', 'documents', 'settings'],
};

export function isTabAllowed(role: UserRole, tabId: string): boolean {
  return ROLE_ALLOWED_TABS[role]?.includes(tabId) ?? false;
}
