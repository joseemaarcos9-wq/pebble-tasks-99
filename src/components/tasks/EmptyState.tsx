import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Plus, Search, Filter } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

interface EmptyStateProps {
  onCreateTask: () => void;
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  const { filters, clearFilters } = useTaskStore();
  
  // Check if user has filters applied
  const hasFilters = filters.search || filters.status !== 'all' || filters.listId || 
                    filters.priority || filters.tags.length > 0 || filters.dateRange;

  if (hasFilters) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center shadow-medium">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Não encontramos tarefas que correspondam aos filtros aplicados.
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button onClick={onCreateTask} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Tarefa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]" data-testid="empty-state-card">
      <Card className="w-full max-w-md text-center shadow-medium">
        <CardContent className="p-8 space-y-6">
          {/* Icon with orange accent */}
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <CheckSquare className="h-6 w-6 text-accent" />
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Sua lista está vazia</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comece criando sua primeira tarefa para 
              organizar seus afazeres.
            </p>
          </div>

          {/* Primary action */}
          <Button 
            onClick={onCreateTask} 
            size="lg" 
            className="w-full h-11 shadow-subtle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira tarefa
          </Button>
          
          {/* Subtle keyboard shortcuts */}
          <div className="text-xs text-muted-foreground/80 space-y-1 pt-2">
            <p>
              <kbd className="px-1.5 py-0.5 bg-muted/60 rounded text-xs">N</kbd> nova tarefa • 
              <kbd className="px-1.5 py-0.5 bg-muted/60 rounded text-xs ml-1">/</kbd> buscar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}