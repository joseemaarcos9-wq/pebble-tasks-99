import { useState } from 'react';
import { Search, Command, Settings, Plus, Filter, DollarSign, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUiStore } from '@/features/ui/store';
import { useTaskStore } from '@/store/useTaskStore';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority } from '@/store/types';

interface TopbarActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCommandOpen: () => void;
  onNewTask?: () => void;
}
export function TopbarActions({
  searchValue,
  onSearchChange,
  onCommandOpen,
  onNewTask
}: TopbarActionsProps) {
  const {
    section,
    go
  } = useUiStore();
  const {
    filters,
    setFilters,
    lists,
    getAllTags
  } = useTaskStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const isTasksSection = section.startsWith('tasks');
  const isFinanceSection = section.startsWith('finance');
  
  const hasActiveFilters = filters.search || 
                          filters.status !== 'all' || 
                          filters.listId || 
                          filters.priority || 
                          filters.tags.length > 0 || 
                          filters.dateRange;
  return (
    <div className="flex items-center gap-3">
      {/* Search - apenas para tarefas */}
      {isTasksSection && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Buscar tarefas... (pressione /)" 
            value={searchValue} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 w-64" 
            data-search-input 
          />
        </div>
      )}

      {/* Tasks-specific actions */}
      {isTasksSection && (
        <>
          {/* Filters Sheet */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                variant={hasActiveFilters ? "default" : "outline"} 
                size="sm" 
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {[
                      filters.search && 1,
                      filters.listId && 1,
                      filters.status !== 'all' && 1,
                      filters.priority && 1,
                      filters.dateRange && 1,
                      filters.tags.length
                    ].filter(Boolean).reduce((a, b) => (a || 0) + (b || 0), 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96">
              <SheetHeader>
                <SheetTitle>Filtros Avançados</SheetTitle>
                <SheetDescription>
                  Configure os filtros para encontrar as tarefas desejadas
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value: 'all' | 'pending' | 'completed') => 
                      setFilters({ status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* List Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lista</label>
                  <Select 
                    value={filters.listId || 'all'} 
                    onValueChange={(value) => 
                      setFilters({ listId: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as listas</SelectItem>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select 
                    value={filters.priority || 'all'} 
                    onValueChange={(value) => 
                      setFilters({ priority: value === 'all' ? undefined : value as Priority })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prazo</label>
                  <Select 
                    value={filters.dateRange || 'all'} 
                    onValueChange={(value) => 
                      setFilters({ dateRange: value === 'all' ? undefined : value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os prazos</SelectItem>
                      <SelectItem value="overdue">Atrasadas</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* New Task Button */}
          <Button 
            onClick={onNewTask} 
            className="gap-2 shadow-subtle" 
            aria-label="Criar nova tarefa (N)"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </>
      )}

      {/* Finance-specific actions */}
      {isFinanceSection && (
        <>
          {/* Quick Finance Actions */}
          <Button 
            onClick={() => go('finance.transactions')} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </Button>
          
          <Button 
            onClick={() => go('finance.budgets')} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Orçamentos</span>
          </Button>
        </>
      )}

      {/* Settings - sempre visível */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => go('settings')} 
        aria-label="Configurações"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}