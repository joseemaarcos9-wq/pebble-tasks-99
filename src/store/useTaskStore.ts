import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskList, Priority, TaskStatus, TaskFilters, Preferences, Subtask, CustomView } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Interface do store principal de tarefas
 * Gerencia todo o estado da aplicação usando Zustand com persistência
 */
interface TaskStore {
  // Estado principal
  tasks: Task[];
  lists: TaskList[];
  customViews: CustomView[];
  filters: TaskFilters;
  preferences: Preferences;
  recentlyDeleted: { task: Task; timestamp: number } | null; // Para funcionalidade de undo
  
  // Ações de tarefas
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: () => void; // Desfazer exclusão
  toggleTaskStatus: (id: string) => void;
  duplicateTask: (id: string) => void; // Nova funcionalidade
  moveTask: (taskId: string, newListId: string) => void; // Nova funcionalidade
  
  // Ações de subtarefas
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  
  // Ações de listas
  addList: (name: string, color?: string) => void;
  updateList: (id: string, updates: Partial<TaskList>) => void;
  deleteList: (id: string) => void;
  
  // Ações de visualizações personalizadas
  addCustomView: (name: string, icon: string, filters: TaskFilters, color?: string) => void;
  updateCustomView: (id: string, updates: Partial<CustomView>) => void;
  deleteCustomView: (id: string) => void;
  
  // Ações de filtros
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  
  // Ações de preferências
  setPreferences: (preferences: Partial<Preferences>) => void;
  
  // Getters computados - otimizados para performance
  getFilteredTasks: () => Task[];
  getTasksByList: (listId: string) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getWeekTasks: () => Task[];
  getAllTags: () => string[];
  getTaskProgress: (listId?: string) => { completed: number; total: number; percentage: number };
}

// Configurações padrão do sistema
const defaultFilters: TaskFilters = {
  status: 'all',
  tags: [],
  search: '',
};

const defaultPreferences: Preferences = {
  theme: 'auto',
  density: 'default',
  weekStartsOn: 1, // Segunda-feira
  timezone: 'America/Sao_Paulo',
};

/**
 * Store principal da aplicação usando Zustand
 * Implementa persistência automática no localStorage
 */

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      tasks: [],
      lists: [],
      customViews: [],
      filters: defaultFilters,
      preferences: defaultPreferences,
      recentlyDeleted: null,

      /**
       * Adiciona uma nova tarefa ao sistema
       * Gera automaticamente ID, timestamps e notifica o usuário
       */

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          photos: taskData.photos || [],
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Feedback para o usuário
        toast({
          title: "Tarefa criada!",
          description: `"${newTask.title}" foi adicionada à sua lista.`,
        });
      },

      /**
       * Atualiza uma tarefa existente
       * Mantém histórico de modificações através do updatedAt
       */

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
        
        toast({
          title: "Tarefa atualizada!",
          description: "As alterações foram salvas.",
        });
      },

      /**
       * Remove uma tarefa do sistema
       * Implementa funcionalidade de undo mantendo a tarefa por 10 segundos
       */

      deleteTask: (id) => {
        const taskToDelete = get().tasks.find(task => task.id === id);
        if (!taskToDelete) return;
        
        // Remove a tarefa
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          recentlyDeleted: { task: taskToDelete, timestamp: Date.now() }
        }));
        
        // Mostra toast simples sem action por enquanto
        toast({
          title: "Tarefa excluída",
          description: `"${taskToDelete.title}" foi removida. Use Ctrl+Z para desfazer.`,
        });
        
        // Remove do recentlyDeleted após 10 segundos
        setTimeout(() => {
          set((state) => ({
            recentlyDeleted: state.recentlyDeleted?.timestamp === Date.now() ? null : state.recentlyDeleted
          }));
        }, 10000);
      },

      /**
       * Restaura a última tarefa excluída (funcionalidade de undo)
       */
      restoreTask: () => {
        const { recentlyDeleted } = get();
        if (!recentlyDeleted) return;
        
        set((state) => ({
          tasks: [...state.tasks, recentlyDeleted.task],
          recentlyDeleted: null
        }));
        
        toast({
          title: "Tarefa restaurada!",
          description: `"${recentlyDeleted.task.title}" foi restaurada.`,
        });
      },

      /**
       * Alterna o status de uma tarefa entre pendente e concluída
       * Atualiza automaticamente o timestamp de conclusão
       */

      toggleTaskStatus: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        
        const newStatus = task.status === 'pendente' ? 'concluida' : 'pendente';
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: newStatus,
                  completedAt: newStatus === 'concluida' ? new Date() : undefined,
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
        
        // Feedback baseado na ação
        toast({
          title: newStatus === 'concluida' ? "Tarefa concluída! 🎉" : "Tarefa reaberta",
          description: newStatus === 'concluida' 
            ? `Parabéns por completar "${task.title}"!`
            : `"${task.title}" foi marcada como pendente.`,
        });
      },

      /**
       * Duplica uma tarefa existente
       * Cria uma cópia com novo ID e timestamp
       */
      duplicateTask: (id) => {
        const taskToDuplicate = get().tasks.find(task => task.id === id);
        if (!taskToDuplicate) return;
        
        const duplicatedTask: Task = {
          ...taskToDuplicate,
          id: uuidv4(),
          title: `${taskToDuplicate.title} (cópia)`,
          status: 'pendente',
          completedAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          subtasks: taskToDuplicate.subtasks.map(st => ({
            ...st,
            id: uuidv4(),
            completed: false
          })),
          photos: [...taskToDuplicate.photos]
        };
        
        set((state) => ({
          tasks: [...state.tasks, duplicatedTask],
        }));
        
        toast({
          title: "Tarefa duplicada!",
          description: `Uma cópia de "${taskToDuplicate.title}" foi criada.`,
        });
      },

      /**
       * Move uma tarefa para uma lista diferente
       */
      moveTask: (taskId, newListId) => {
        const task = get().tasks.find(t => t.id === taskId);
        const newList = get().lists.find(l => l.id === newListId);
        if (!task || !newList) return;
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, listId: newListId, updatedAt: new Date() }
              : task
          ),
        }));
        
        toast({
          title: "Tarefa movida!",
          description: `"${task.title}" foi movida para "${newList.name}".`,
        });
      },

      /**
       * Adiciona uma nova subtarefa a uma tarefa existente
       */

      addSubtask: (taskId, title) => {
        const newSubtask: Subtask = {
          id: uuidv4(),
          title,
          completed: false,
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, newSubtask],
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      removeSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },

      addList: (name, color) => {
        const newList: TaskList = {
          id: uuidv4(),
          name,
          color,
          createdAt: new Date(),
        };
        set((state) => ({
          lists: [...state.lists, newList],
        }));
      },

      updateList: (id, updates) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...updates } : list
          ),
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
          tasks: state.tasks.filter((task) => task.listId !== id),
        }));
      },

      addCustomView: (name, icon, filters, color) => {
        const newView: CustomView = {
          id: uuidv4(),
          name,
          icon,
          color,
          filters,
          createdAt: new Date(),
        };
        set((state) => ({
          customViews: [...state.customViews, newView],
        }));
        
        toast({
          title: "Visualização criada!",
          description: `"${name}" foi adicionada às suas visualizações.`,
        });
      },

      updateCustomView: (id, updates) => {
        set((state) => ({
          customViews: state.customViews.map((view) =>
            view.id === id ? { ...view, ...updates } : view
          ),
        }));
        
        toast({
          title: "Visualização atualizada!",
          description: "As alterações foram salvas.",
        });
      },

      deleteCustomView: (id) => {
        set((state) => ({
          customViews: state.customViews.filter((view) => view.id !== id),
        }));
        
        toast({
          title: "Visualização excluída",
          description: "A visualização foi removida.",
        });
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: defaultFilters });
      },

      setPreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        let filtered = [...tasks];

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((task) =>
            filters.status === 'pending'
              ? task.status === 'pendente'
              : task.status === 'concluida'
          );
        }

        // Filter by list
        if (filters.listId) {
          filtered = filtered.filter((task) => task.listId === filters.listId);
        }

        // Filter by priority
        if (filters.priority) {
          filtered = filtered.filter((task) => task.priority === filters.priority);
        }

        // Filter by tags
        if (filters.tags.length > 0) {
          filtered = filtered.filter((task) =>
            filters.tags.some((tag) => task.tags.includes(tag))
          );
        }

        // Filter by date range
        if (filters.dateRange) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            
            switch (filters.dateRange) {
              case 'today':
                return dueDate.toDateString() === today.toDateString();
              case 'overdue':
                return dueDate < today;
              case 'week':
                const weekFromNow = new Date(today);
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return dueDate >= today && dueDate <= weekFromNow;
              default:
                return true;
            }
          });
        }

        // Filter by search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter((task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower) ||
            task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        return filtered;
      },

      getTasksByList: (listId) => {
        const { tasks } = get();
        return tasks.filter((task) => task.listId === listId);
      },

      getOverdueTasks: () => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks.filter(
          (task) =>
            task.status === 'pendente' &&
            task.dueDate &&
            new Date(task.dueDate) < today
        );
      },

      getTodayTasks: () => {
        const { tasks } = get();
        const today = new Date();
        
        return tasks.filter(
          (task) =>
            task.status === 'pendente' &&
            task.dueDate &&
            new Date(task.dueDate).toDateString() === today.toDateString()
        );
      },

      getWeekTasks: () => {
        const { tasks } = get();
        const today = new Date();
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        
        return tasks.filter(
          (task) =>
            task.status === 'pendente' &&
            task.dueDate &&
            new Date(task.dueDate) >= today &&
            new Date(task.dueDate) <= weekFromNow
        );
      },

      getAllTags: () => {
        const { tasks } = get();
        const allTags = tasks.flatMap((task) => task.tags);
        return [...new Set(allTags)].sort();
      },

      /**
       * Calcula o progresso de conclusão das tarefas
       * Pode ser filtrado por lista específica
       */
      getTaskProgress: (listId) => {
        const { tasks } = get();
        let relevantTasks = tasks;
        
        if (listId) {
          relevantTasks = tasks.filter(task => task.listId === listId);
        }
        
        const total = relevantTasks.length;
        const completed = relevantTasks.filter(task => task.status === 'concluida').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
      },
    }),
    {
      name: 'pebble-tasks-storage',
    }
  )
);