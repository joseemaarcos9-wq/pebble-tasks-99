import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/providers/DataProvider';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { CalendarDays, AlertTriangle, Clock, List } from 'lucide-react';

export function QuickFilters() {
  const { tasks } = useData();
  const { filters, updateFilters } = useTaskFilters();
  const { tasks: tasksList, lists } = tasks;
  
  // Calculate quick filter counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = tasksList.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date) < today
  );
  
  const todayTasks = tasksList.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date).toDateString() === today.toDateString()
  );
  
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  const weekTasks = tasksList.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date) >= today &&
      new Date(task.due_date) <= weekFromNow
  );

  const hasQuickFilters = overdueTasks.length > 0 || todayTasks.length > 0 || weekTasks.length > 0;
  const hasLists = lists.length > 0;

  if (!hasQuickFilters && !hasLists) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/30 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground mr-2">Filtros rápidos:</span>
      
      {/* List Filter */}
      {hasLists && (
        <Select
          value={filters.listId || 'all'}
          onValueChange={(value) => 
            updateFilters({ listId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[160px] h-8">
            <List className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Todas as listas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as listas</SelectItem>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: list.color || '#6b7280' }}
                  />
                  {list.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {overdueTasks.length > 0 && (
        <Button
          variant={filters.dateRange === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => 
            updateFilters({ 
              dateRange: filters.dateRange === 'overdue' ? undefined : 'overdue' 
            })
          }
          className="gap-2"
        >
          <AlertTriangle className="h-3 w-3 text-destructive" />
          Atrasadas
          <Badge variant="destructive" className="ml-1 text-xs">
            {overdueTasks.length}
          </Badge>
        </Button>
      )}
      
      {todayTasks.length > 0 && (
        <Button
          variant={filters.dateRange === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => 
            updateFilters({ 
              dateRange: filters.dateRange === 'today' ? undefined : 'today' 
            })
          }
          className="gap-2"
        >
          <CalendarDays className="h-3 w-3 text-accent" />
          Hoje
          <Badge variant="outline" className="ml-1 text-xs border-accent text-accent">
            {todayTasks.length}
          </Badge>
        </Button>
      )}
      
      {weekTasks.length > 0 && (
        <Button
          variant={filters.dateRange === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => 
            updateFilters({ 
              dateRange: filters.dateRange === 'week' ? undefined : 'week' 
            })
          }
          className="gap-2"
        >
          <Clock className="h-3 w-3" />
          Esta Semana
          <Badge variant="secondary" className="ml-1 text-xs">
            {weekTasks.length}
          </Badge>
        </Button>
      )}
    </div>
  );
}