/**
 * Tipos TypeScript para o módulo financeiro
 */

export type AccountType = 'carteira' | 'banco' | 'cartao';
export type CategoryType = 'despesa' | 'receita';
export type TransactionType = 'despesa' | 'receita' | 'transferencia';
export type TransactionStatus = 'pendente' | 'compensada';
export type RecurrenceFrequency = 'mensal' | 'semanal' | 'anual' | 'custom';

export interface Account {
  id: string;
  nome: string;
  tipo: AccountType;
  saldoInicial: number;
  moeda: 'BRL';
  cor?: string;
  arquivada?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  nome: string;
  tipo: CategoryType;
  parentId?: string;
  cor?: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  nome: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  data: string; // ISO date string
  contaId: string;
  valor: number;
  tipo: TransactionType;
  categoriaId?: string;
  descricao?: string;
  tags: string; // comma-separated tag names
  anexoURL?: string;
  status: TransactionStatus;
  meta?: {
    linkId?: string; // Para transferências vinculadas
    direction?: 'origem' | 'destino'; // Direção da transferência
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Recurrence {
  id: string;
  tipo: Exclude<TransactionType, 'transferencia'>; // sem transferência
  frequencia: RecurrenceFrequency;
  diaBase: number; // dia do mês/semana
  proximaOcorrencia: string; // ISO date string
  contaId: string;
  valor: number;
  categoriaId?: string;
  descricao?: string;
  tags: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  categoriaId: string;
  valorPlanejado: number;
  mesAno: string; // 'YYYY-MM' format
  alertThresholdPct: number; // percentage 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancePreferences {
  defaultCurrency: 'BRL';
  defaultAccount?: string;
  budgetAlertDays: number; // dias antes do fim do mês para alertar
  autoGenerateRecurrence: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: TransactionFilters;
  createdAt: Date;
}

export interface TransactionFilters {
  period?: 'today' | 'this-week' | 'this-month' | 'last-month' | 'custom';
  startDate?: string;
  endDate?: string;
  accountIds: string[];
  types: TransactionType[];
  status: TransactionStatus[];
  categoryIds: string[];
  tags: string[];
  search: string;
  sortBy: 'data' | 'valor' | 'conta' | 'categoria';
  sortOrder: 'asc' | 'desc';
}

export interface FinanceState {
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  budgets: Budget[];
  filterPresets: FilterPreset[];
  preferences: FinancePreferences;
  
  // UI state
  currentFilters: TransactionFilters;
  selectedTransactions: string[];
  
  // History for undo/redo
  history: FinanceHistoryEntry[];
  historyIndex: number;
}

export interface FinanceHistoryEntry {
  action: string;
  timestamp: Date;
  data: any;
}

// Computed types
export interface AccountBalance {
  accountId: string;
  saldoAtual: number;
  saldoInicial: number;
  totalReceitas: number;
  totalDespesas: number;
  totalTransferenciasIn: number;
  totalTransferenciasOut: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  spent: number;
  budgeted?: number;
  percentage?: number;
  transactions: Transaction[];
}

export interface BudgetStatus {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  valorPlanejado: number;
  valorGasto: number;
  percentage: number;
  status: 'ok' | 'warning' | 'exceeded';
  remainingDays: number;
}

export interface UpcomingRecurrence {
  recurrenceId: string;
  nextDate: string;
  description: string;
  valor: number;
  accountName: string;
  daysUntil: number;
}

export interface DashboardData {
  totalBalance: number;
  weeklyDue: number;
  overdue: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topBudgets: BudgetStatus[];
  upcomingRecurrences: UpcomingRecurrence[];
  dailyBalanceChart: { date: string; balance: number }[];
  expensesByCategory: { category: string; value: number; color?: string }[];
  monthlyComparison: { month: string; receita: number; despesa: number }[];
}