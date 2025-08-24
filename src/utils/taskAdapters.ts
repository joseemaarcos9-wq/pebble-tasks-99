// Adaptador temporário para converter entre tipos de Task antigo e novo
import { Task as NewTask } from '@/hooks/useTasks';
import { Task as OldTask } from '@/store/types';

export function adaptTaskToOld(newTask: NewTask): OldTask {
  return {
    id: newTask.id,
    title: newTask.title,
    description: newTask.description || undefined,
    priority: newTask.priority,
    status: newTask.status,
    listId: newTask.list_id,
    tags: newTask.tags,
    dueDate: newTask.due_date ? new Date(newTask.due_date) : undefined,
    completedAt: newTask.completed_at ? new Date(newTask.completed_at) : undefined,
    createdAt: new Date(newTask.created_at),
    updatedAt: new Date(newTask.updated_at),
    subtasks: [], // TODO: Buscar subtarefas reais
    link: newTask.link || undefined,
    photos: newTask.photos || [],
  };
}

export function adaptTaskToNew(oldTask: Partial<OldTask>): Partial<NewTask> {
  return {
    title: oldTask.title,
    description: oldTask.description || null,
    priority: oldTask.priority,
    status: oldTask.status,
    list_id: oldTask.listId,
    tags: oldTask.tags || [],
    due_date: oldTask.dueDate ? oldTask.dueDate.toISOString() : null,
    link: oldTask.link || null,
    photos: oldTask.photos || [],
  };
}