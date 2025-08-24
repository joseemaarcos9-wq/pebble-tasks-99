import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskDialog } from './TaskDialog';
import { TaskProgress } from './TaskProgress';
import { Search, Plus, Settings, Filter, SortAsc, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Priority } from '@/store/types';

/**
 * Header principal da aplicação de tarefas
 * Inclui busca, filtros, criação de tarefas e navegação
 */

export function TaskHeader() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { 
    filters, 
    setFilters, 
    clearFilters,
    getFilteredTasks, 
    getOverdueTasks, 
    getTodayTasks,
    lists,
    getAllTags
  } = useTaskStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredTasks = getFilteredTasks();
  const overdueTasks = getOverdueTasks();
  const todayTasks = getTodayTasks();
  const allTags = getAllTags();

  /**
   * Determina o título do header baseado nos filtros ativos
   */

  const getHeaderTitle = () => {
    if (filters.dateRange === 'today') return 'Hoje';
    if (filters.dateRange === 'overdue') return 'Atrasadas';
    if (filters.dateRange === 'week') return 'Esta Semana';
    if (filters.listId) {
      const list = lists.find(l => l.id === filters.listId);
      return list ? `Lista: ${list.name}` : 'Lista Personalizada';
    }
    if (filters.status === 'pending') return 'Tarefas Pendentes';
    if (filters.status === 'completed') return 'Tarefas Concluídas';
    if (filters.search) return `Busca: "${filters.search}"`;
    return 'Todas as Tarefas';
  };

  /**
   * Calcula a contagem de tarefas para exibir no badge
   */

  const getTaskCount = () => {
    if (filters.dateRange === 'today') return todayTasks.length;
    if (filters.dateRange === 'overdue') return overdueTasks.length;
    return filteredTasks.length;
  };

  /**
   * Verifica se há filtros ativos além do padrão
   */
  const hasActiveFilters = () => {
    return filters.search || 
           filters.status !== 'all' || 
           filters.listId || 
           filters.priority || 
           filters.tags.length > 0 || 
           filters.dateRange;
  };

  /**
   * Foca no input de busca (usado pelos atalhos de teclado)
   */
  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  // Expor a função para uso externo (atalhos)
  useEffect(() => {
    (window as any).focusSearch = focusSearch;
    return () => {
      delete (window as any).focusSearch;
    };
  }, []);

  return (
    <>
      {/* Header principal */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold">{getHeaderTitle()}</h1>
              <Badge variant="secondary" className="text-xs">
                {getTaskCount()}
              </Badge>
              {hasActiveFilters() && (
                <Badge variant="outline" className="text-xs">
                  Filtros ativos
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Busca global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar tarefas... (Press / to focus)"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 w-64"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ search: '' })}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Botão de filtros */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            {/* Nova tarefa */}
            <Button
              onClick={() => setIsTaskDialogOpen(true)}
              className="shadow-subtle"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>

            {/* Configurações */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barra de filtros expandida */}
        {showFilters && (
          <div className="px-6 pb-4 space-y-3 border-t bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
              {/* Filtro por status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value: 'all' | 'pending' | 'completed') => 
                    setFilters({ status: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por lista */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Lista</label>
                <Select
                  value={filters.listId || 'all'}
                  onValueChange={(value) => 
                    setFilters({ listId: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-8">
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

              {/* Filtro por prioridade */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => 
                    setFilters({ priority: value === 'all' ? undefined : value as Priority })
                  }
                >
                  <SelectTrigger className="h-8">
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

              {/* Filtro por prazo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Prazo</label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => 
                    setFilters({ dateRange: value === 'all' ? undefined : value as any })
                  }
                >
                  <SelectTrigger className="h-8">
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

            {/* Ações dos filtros */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar filtros
                  </Button>
                )}
              </div>
              
              {/* Progress bar quando há filtros ativos */}
              {hasActiveFilters() && (
                <TaskProgress className="flex-1 max-w-xs" />
              )}
            </div>
          </div>
        )}

        {/* Filtros rápidos sempre visíveis */}
        {(overdueTasks.length > 0 || todayTasks.length > 0) && !showFilters && (
          <div className="px-6 pb-3 flex items-center space-x-2">
            {overdueTasks.length > 0 && (
              <Button
                variant={filters.dateRange === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => 
                  setFilters({ 
                    dateRange: filters.dateRange === 'overdue' ? undefined : 'overdue' 
                  })
                }
                className="text-xs"
              >
                <span className="w-2 h-2 bg-destructive rounded-full mr-2" />
                Atrasadas ({overdueTasks.length})
              </Button>
            )}
            
            {todayTasks.length > 0 && (
              <Button
                variant={filters.dateRange === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => 
                  setFilters({ 
                    dateRange: filters.dateRange === 'today' ? undefined : 'today' 
                  })
                }
                className="text-xs"
              >
                <span className="w-2 h-2 bg-accent rounded-full mr-2" />
                Hoje ({todayTasks.length})
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Dialog de nova tarefa */}

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
      />
    </>
  );
}