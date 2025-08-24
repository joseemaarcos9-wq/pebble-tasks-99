export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';

export type TaskStatus = 'pendente' | 'concluida';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  listId: string;
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
  link?: string;
  photos: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskList {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface CustomView {
  id: string;
  name: string;
  icon: string;
  color?: string;
  filters: TaskFilters;
  createdAt: Date;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'default';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  timezone: string;
}

export interface TaskFilters {
  status: 'all' | 'pending' | 'completed';
  listId?: string;
  priority?: Priority;
  tags: string[];
  dateRange?: 'today' | 'week' | 'overdue';
  search: string;
}