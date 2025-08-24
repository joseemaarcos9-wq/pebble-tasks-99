import { useTaskStore } from '../useTaskStore';
import { Task, TaskFilters, Priority } from '../types';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para filtros avançados de tarefas
 */
export function useTaskFilters() {
  const store = useTaskStore();

  const savedFilters = [
    {
      id: 'high-priority',
      name: 'Alta Prioridade',
      filters: { priority: 'alta' as Priority, status: 'pending' as const }
    },
    {
      id: 'due-today',
      name: 'Vencendo Hoje',
      filters: { dateRange: 'today' as const, status: 'pending' as const }
    },
    {
      id: 'overdue',
      name: 'Atrasadas',
      filters: { dateRange: 'overdue' as const }
    },
    {
      id: 'completed-this-week',
      name: 'Concluídas esta Semana',
      filters: { dateRange: 'week' as const, status: 'completed' as const }
    }
  ];

  const applyQuickFilter = (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (!filter) return;

    store.setFilters(filter.filters);
    
    toast({
      title: `Filtro aplicado: ${filter.name}`,
      description: "Visualização atualizada"
    });
  };

  const createCustomFilter = (name: string, filters: Partial<TaskFilters>) => {
    // Em uma implementação real, isso seria salvo no localStorage ou backend
    const customFilter = {
      id: `custom-${Date.now()}`,
      name,
      filters
    };

    store.setFilters(filters);
    
    toast({
      title: `Filtro personalizado criado: ${name}`,
      description: "Filtro aplicado com sucesso"
    });

    return customFilter;
  };

  const getFilteredTasksAdvanced = (customFilters?: Partial<TaskFilters>) => {
    const filters = customFilters || store.filters;
    let filtered = [...store.tasks];

    // Filtro por múltiplas prioridades
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filtro por múltiplas listas
    if (filters.listId) {
      filtered = filtered.filter(task => task.listId === filters.listId);
    }

    // Filtro por múltiplas tags (AND/OR logic)
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        filters.tags!.some(tag => task.tags.includes(tag))
      );
    }

    // Filtro de texto avançado (título, descrição, tags, subtarefas)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
        const tagMatch = task.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const subtaskMatch = task.subtasks.some(st => st.title.toLowerCase().includes(searchLower));
        
        return titleMatch || descriptionMatch || tagMatch || subtaskMatch;
      });
    }

    // Filtro por data de vencimento
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
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

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(task =>
        filters.status === 'pending'
          ? task.status === 'pendente'
          : task.status === 'concluida'
      );
    }

    return filtered;
  };

  const getFilterSuggestions = (searchTerm: string) => {
    if (!searchTerm) return [];

    const allTags = store.getAllTags();
    const allListNames = store.lists.map(l => l.name);
    
    const tagSuggestions = allTags
      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(tag => ({ type: 'tag', value: tag, display: `#${tag}` }));
    
    const listSuggestions = allListNames
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(name => ({ type: 'list', value: name, display: `Lista: ${name}` }));

    const prioritySuggestions = ['baixa', 'media', 'alta', 'urgente']
      .filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(priority => ({ type: 'priority', value: priority, display: `Prioridade: ${priority}` }));

    return [...tagSuggestions, ...listSuggestions, ...prioritySuggestions];
  };

  const buildSmartFilter = (query: string) => {
    const filters: Partial<TaskFilters> = { search: '' };
    const terms = query.split(' ');
    
    terms.forEach(term => {
      if (term.startsWith('#')) {
        // Tag filter
        const tag = term.substring(1);
        filters.tags = [...(filters.tags || []), tag];
      } else if (term.startsWith('lista:')) {
        // List filter
        const listName = term.substring(6);
        const list = store.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
        if (list) filters.listId = list.id;
      } else if (term.startsWith('prioridade:')) {
        // Priority filter
        const priority = term.substring(11) as Priority;
        if (['baixa', 'media', 'alta', 'urgente'].includes(priority)) {
          filters.priority = priority;
        }
      } else if (term === 'hoje') {
        filters.dateRange = 'today';
      } else if (term === 'atrasadas') {
        filters.dateRange = 'overdue';
      } else if (term === 'semana') {
        filters.dateRange = 'week';
      } else if (term === 'pendentes') {
        filters.status = 'pending';
      } else if (term === 'concluidas') {
        filters.status = 'completed';
      } else {
        // Regular search term
        filters.search = filters.search ? `${filters.search} ${term}` : term;
      }
    });

    return filters;
  };

  return {
    savedFilters,
    applyQuickFilter,
    createCustomFilter,
    getFilteredTasksAdvanced,
    getFilterSuggestions,
    buildSmartFilter,
    ...store
  };
}