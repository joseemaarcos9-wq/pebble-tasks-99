// Types from the Supabase database
export type { 
  Task,
  TaskList,
  Subtask,
  CustomView,
  FinanceAccount,
  FinanceCategory,
  FinanceTag,
  FinanceTransaction,
  FinanceRecurrence,
  FinanceBudget,
  FinanceFilterPreset
} from '@/integrations/supabase/types';

// App-specific types
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
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