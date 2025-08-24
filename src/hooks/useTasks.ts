import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Types matching database schema
export interface TaskList {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  list_id: string;
  title: string;
  description: string | null;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'concluida';
  tags: string[];
  due_date: string | null;
  completed_at: string | null;
  link: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface CustomView {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string | null;
  filters: any;
  created_at: string;
}

export interface TaskFilters {
  status: 'all' | 'pending' | 'completed';
  listId?: string;
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
  dateRange?: 'today' | 'week' | 'overdue';
  search: string;
}

const defaultFilters: TaskFilters = {
  status: 'all',
  tags: [],
  search: '',
};

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [filters, setFiltersState] = useState<TaskFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchAllData = async () => {
    if (!user) {
      setTasks([]);
      setLists([]);
      setSubtasks([]);
      setCustomViews([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch in parallel for better performance
      const [tasksResult, listsResult, subtasksResult, viewsResult] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('task_lists').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('subtasks').select('*'),
        supabase.from('custom_views').select('*').eq('user_id', user.id).order('created_at'),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (listsResult.error) throw listsResult.error;
      if (subtasksResult.error) throw subtasksResult.error;
      if (viewsResult.error) throw viewsResult.error;

      setTasks(tasksResult.data || []);
      setLists(listsResult.data || []);
      setSubtasks(subtasksResult.data || []);
      setCustomViews(viewsResult.data || []);
    } catch (error: any) {
      console.error('Error fetching tasks data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Task CRUD operations
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      toast({
        title: "Tarefa criada!",
        description: `"${data.title}" foi adicionada à sua lista.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) return;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Tarefa excluída",
        description: `"${taskToDelete.title}" foi removida.`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [tasks]);

  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'pendente' ? 'concluida' : 'pendente';
    const updates: Partial<Task> = {
      status: newStatus,
      completed_at: newStatus === 'concluida' ? new Date().toISOString() : null,
    };

    return updateTask(id, updates);
  }, [tasks, updateTask]);

  // List CRUD operations
  const addList = useCallback(async (name: string, color?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_lists')
        .insert({
          name,
          color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLists(prev => [...prev, data]);
      toast({
        title: "Lista criada!",
        description: `"${data.name}" foi adicionada.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar lista",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  const updateList = useCallback(async (id: string, updates: Partial<TaskList>) => {
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLists(prev => prev.map(list => list.id === id ? data : list));
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar lista",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const deleteList = useCallback(async (id: string) => {
    try {
      // Delete list and its tasks (cascade)
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLists(prev => prev.filter(list => list.id !== id));
      setTasks(prev => prev.filter(task => task.list_id !== id));

      toast({
        title: "Lista excluída",
        description: "A lista e suas tarefas foram removidas.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir lista",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  // Subtask operations
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      setSubtasks(prev => [...prev, data]);
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar subtarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update({ completed: !subtask.completed })
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;

      setSubtasks(prev => prev.map(s => s.id === subtaskId ? data : s));
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar subtarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [subtasks]);

  const removeSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover subtarefa",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  // Filtering and computed values
  const getFilteredTasks = useCallback(() => {
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
      filtered = filtered.filter((task) => task.list_id === filters.listId);
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
        if (!task.due_date) return false;
        
        const dueDate = new Date(task.due_date);
        
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
  }, [tasks, filters]);

  const getTasksByList = useCallback((listId: string) => {
    return tasks.filter((task) => task.list_id === listId);
  }, [tasks]);

  const getAllTags = useCallback(() => {
    const allTags = tasks.flatMap((task) => task.tags);
    return [...new Set(allTags)].sort();
  }, [tasks]);

  const getTaskProgress = useCallback((listId?: string) => {
    let relevantTasks = tasks;
    
    if (listId) {
      relevantTasks = tasks.filter(task => task.list_id === listId);
    }
    
    const total = relevantTasks.length;
    const completed = relevantTasks.filter(task => task.status === 'concluida').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [tasks]);

  // Filters management
  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Load data on mount and user change
  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch tasks when changes occur
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_lists',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    // Data
    tasks,
    lists,
    subtasks,
    customViews,
    filters,
    loading,

    // Task operations
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,

    // List operations
    addList,
    updateList,
    deleteList,

    // Subtask operations
    addSubtask,
    toggleSubtask,
    removeSubtask,

    // Computed values
    getFilteredTasks,
    getTasksByList,
    getAllTags,
    getTaskProgress,

    // Filter operations
    setFilters,
    clearFilters,

    // Utilities
    refetch: fetchAllData,
  };
}