// Types from the Supabase database using correct table names
export type Task = {
  id: string;
  user_id: string;
  list_id: string;
  title: string;
  description?: string;
  status: 'pendente' | 'concluida';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
  due_date?: string;
  completed_at?: string;
  link?: string;
  photos: string[];
  created_at: string;
  updated_at: string;
};

export type TaskList = {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
};

export type Subtask = {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

export type CustomView = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color?: string;
  filters: Record<string, unknown>;
  created_at: string;
};

export type FinanceAccount = {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'carteira' | 'banco' | 'cartao';
  saldo_inicial: number;
  moeda?: string;
  cor?: string;
  arquivada?: boolean;
  created_at: string;
  updated_at: string;
};

export type FinanceCategory = {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'despesa' | 'receita';
  parent_id?: string;
  cor?: string;
  created_at: string;
};

export type FinanceTag = {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
};

export type FinanceTransaction = {
  id: string;
  user_id: string;
  conta_id: string;
  categoria_id?: string;
  data: string;
  valor: number;
  tipo: 'despesa' | 'receita' | 'transferencia';
  status: 'pendente' | 'compensada';
  descricao?: string;
  tags?: string;
  anexo_url?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type FinanceRecurrence = {
  id: string;
  user_id: string;
  conta_id: string;
  categoria_id?: string;
  tipo: 'despesa' | 'receita';
  frequencia: 'mensal' | 'semanal' | 'anual' | 'custom';
  dia_base: number;
  proxima_ocorrencia: string;
  valor: number;
  descricao?: string;
  tags?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type FinanceBudget = {
  id: string;
  user_id: string;
  categoria_id: string;
  valor_planejado: number;
  mes_ano: string;
  alert_threshold_pct?: number;
  created_at: string;
  updated_at: string;
};

export type FinanceFilterPreset = {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  created_at: string;
};

// App-specific types
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'concluida';
export type TaskFilters = {
  status: TaskStatus[];
  priority: Priority[];
  listId: string[];
  dateRange: { start?: Date; end?: Date };
  search: string;
};

// Legacy Zustand type compatibility
export interface ZustandTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  listId: string;
  dueDate?: Date;
  subtasks: { id: string; title: string; completed: boolean }[];
  link?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}