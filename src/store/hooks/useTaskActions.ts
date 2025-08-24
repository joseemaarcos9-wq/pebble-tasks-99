import { useTaskStore } from '../useTaskStore';
import { Task, Subtask } from '../types';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook customizado para ações de tarefas
 * Separado do store principal para melhor organização
 */
export function useTaskActions() {
  const store = useTaskStore();

  const createTaskFromTemplate = (template: Partial<Task>) => {
    const baseTask = {
      title: 'Nova tarefa',
      priority: 'media' as const,
      status: 'pendente' as const,
      listId: store.lists[0]?.id || '',
      tags: [],
      subtasks: [],
      photos: [],
      ...template
    };
    
    store.addTask(baseTask);
  };

  const createQuickTask = (title: string, listId?: string) => {
    const targetListId = listId || store.lists[0]?.id || '';
    
    store.addTask({
      title,
      priority: 'media',
      status: 'pendente',
      listId: targetListId,
      tags: [],
      subtasks: [],
      photos: []
    });
  };

  const bulkUpdateTasks = (taskIds: string[], updates: Partial<Task>) => {
    taskIds.forEach(id => {
      store.updateTask(id, updates);
    });
    
    toast({
      title: `${taskIds.length} tarefas atualizadas!`,
      description: "As alterações foram aplicadas em lote."
    });
  };

  const archiveTasks = (taskIds: string[]) => {
    // Para simular arquivamento, vamos marcar como concluídas
    bulkUpdateTasks(taskIds, { status: 'concluida' });
    
    toast({
      title: `${taskIds.length} tarefas arquivadas!`,
      description: "As tarefas foram movidas para o arquivo."
    });
  };

  const duplicateTaskWithOptions = (taskId: string, options: {
    keepDueDate?: boolean;
    keepSubtasks?: boolean;
    newTitle?: string;
  } = {}) => {
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) return;

    const duplicatedTask: Task = {
      ...task,
      id: uuidv4(),
      title: options.newTitle || `${task.title} (cópia)`,
      status: 'pendente',
      completedAt: undefined,
      dueDate: options.keepDueDate ? task.dueDate : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: options.keepSubtasks 
        ? task.subtasks.map(st => ({
            ...st,
            id: uuidv4(),
            completed: false
          }))
        : []
    };

    store.addTask(duplicatedTask);
  };

  const createTaskFromSubtask = (taskId: string, subtaskId: string) => {
    const task = store.tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(st => st.id === subtaskId);
    
    if (!task || !subtask) return;

    const newTask = {
      title: subtask.title,
      description: `Criada a partir da subtarefa de "${task.title}"`,
      priority: task.priority,
      status: 'pendente' as const,
      listId: task.listId,
      tags: [...task.tags],
      subtasks: [],
      photos: []
    };

    store.addTask(newTask);
    store.removeSubtask(taskId, subtaskId);

    toast({
      title: "Subtarefa promovida!",
      description: `"${subtask.title}" agora é uma tarefa independente.`
    });
  };

  const convertTaskToSubtask = (taskId: string, parentTaskId: string) => {
    const task = store.tasks.find(t => t.id === taskId);
    const parentTask = store.tasks.find(t => t.id === parentTaskId);
    
    if (!task || !parentTask) return;

    // Adiciona como subtarefa
    store.addSubtask(parentTaskId, task.title);
    
    // Remove a tarefa original
    store.deleteTask(taskId);

    toast({
      title: "Tarefa convertida!",
      description: `"${task.title}" agora é uma subtarefa.`
    });
  };

  return {
    createTaskFromTemplate,
    createQuickTask,
    bulkUpdateTasks,
    archiveTasks,
    duplicateTaskWithOptions,
    createTaskFromSubtask,
    convertTaskToSubtask,
    ...store
  };
}