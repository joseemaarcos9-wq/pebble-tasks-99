import { TaskList } from './TaskList';
import { EmptyState } from './EmptyState';
import { TaskDialog } from './TaskDialog';
import { useTaskStore } from '@/store/useTaskStore';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuickFilters } from './QuickFilters';
import { TaskStats } from './TaskStats';

/**
 * Container principal para a lista de tarefas
 * Gerencia estado vazio, filtros ativos e exibição da lista
 */
export function TaskListContainer() {
  const { 
    getFilteredTasks, 
    filters, 
    setFilters, 
    clearFilters,
    lists 
  } = useTaskStore();
  const { toast } = useToast();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // Listen for topbar new task trigger
  useEffect(() => {
    const checkTrigger = () => {
      const trigger = document.querySelector('[data-new-task-trigger="true"]');
      if (trigger) {
        setIsTaskDialogOpen(true);
        // Reset the trigger
        trigger.setAttribute('data-new-task-trigger', 'false');
      }
    };

    const interval = setInterval(checkTrigger, 100);
    return () => clearInterval(interval);
  }, []);
  
  const filteredTasks = getFilteredTasks();
  const hasActiveFilters = filters.search || 
                          filters.status !== 'all' || 
                          filters.listId || 
                          filters.priority || 
                          filters.tags.length > 0 || 
                          filters.dateRange;

  const getListName = (listId?: string) => {
    if (!listId) return null;
    const list = lists.find(l => l.id === listId);
    return list?.name;
  };

  const getActiveFilterChips = () => {
    const chips = [];
    
    if (filters.search) {
      chips.push({
        label: `Busca: "${filters.search}"`,
        onRemove: () => {
          setFilters({ search: '' });
          toast({ description: "Filtro de busca removido" });
        }
      });
    }
    
    if (filters.listId) {
      const listName = getListName(filters.listId);
      chips.push({
        label: `Lista: ${listName || 'Personalizada'}`,
        onRemove: () => {
          setFilters({ listId: undefined });
          toast({ description: "Filtro de lista removido" });
        }
      });
    }
    
    if (filters.status !== 'all') {
      chips.push({
        label: `Status: ${filters.status === 'pending' ? 'Pendentes' : 'Concluídas'}`,
        onRemove: () => {
          setFilters({ status: 'all' });
          toast({ description: "Filtro de status removido" });
        }
      });
    }
    
    if (filters.priority) {
      chips.push({
        label: `Prioridade: ${filters.priority}`,
        onRemove: () => {
          setFilters({ priority: undefined });
          toast({ description: "Filtro de prioridade removido" });
        }
      });
    }
    
    if (filters.dateRange) {
      const dateLabels = {
        'today': 'Hoje',
        'overdue': 'Atrasadas',
        'week': 'Esta semana'
      };
      chips.push({
        label: `Prazo: ${dateLabels[filters.dateRange as keyof typeof dateLabels]}`,
        onRemove: () => {
          setFilters({ dateRange: undefined });
          toast({ description: "Filtro de prazo removido" });
        }
      });
    }
    
    filters.tags.forEach(tag => {
      chips.push({
        label: `#${tag}`,
        onRemove: () => {
          setFilters({ 
            tags: filters.tags.filter(t => t !== tag) 
          });
          toast({ description: `Etiqueta #${tag} removida` });
        }
      });
    });
    
    return chips;
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1">
        <QuickFilters />
        
        <div className="px-6">
          {/* Active filters header */}
          {hasActiveFilters && (
            <div className="py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Filtros ativos:</span>
                  {getActiveFilterChips().map((chip, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {chip.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={chip.onRemove}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  clearFilters();
                  toast({ description: "Todos os filtros removidos" });
                }}>
                  Limpar filtros
                </Button>
              </div>
            </div>
          )}
          
          <EmptyState onCreateTask={() => setIsTaskDialogOpen(true)} />
          
          <TaskDialog
            isOpen={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <QuickFilters />
      
      <div className="px-6">
        {/* Active filters header */}
        {hasActiveFilters && (
          <div className="py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Filtros ativos:</span>
                {getActiveFilterChips().map((chip, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {chip.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={chip.onRemove}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                clearFilters();
                toast({ description: "Todos os filtros removidos" });
              }}>
                Limpar filtros
              </Button>
            </div>
          </div>
        )}

        {/* Task list with max width and proper padding */}
        <div className="max-w-4xl mx-auto py-6">
          <div className="space-y-6">
            {/* Stats Overview */}
            <TaskStats />
            
            {/* Quick Add Button */}
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => setIsTaskDialogOpen(true)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Adicionar tarefa rápida...
              </Button>
            </div>
            
            <TaskList />
          </div>
        </div>
        
        <TaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
        />
      </div>
    </div>
  );
}