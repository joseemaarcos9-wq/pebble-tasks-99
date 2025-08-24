import { useData } from '@/components/providers/DataProvider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Clock, AlertTriangle, CalendarDays } from 'lucide-react';

export function TaskStats() {
  const { tasks: { tasks, getFilteredTasks } } = useData();
  
  const allTasks = getFilteredTasks();
  const completedTasks = allTasks.filter(task => task.status === 'concluida');
  const pendingTasks = allTasks.filter(task => task.status === 'pendente');
  
  // Calculate overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date) < today
  );
  
  // Calculate today tasks
  const todayTasks = tasks.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date).toDateString() === today.toDateString()
  );
  
  const completionRate = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <CheckSquare className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{allTasks.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{pendingTasks.length}</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {overdueTasks.length > 0 && (
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{overdueTasks.length}</div>
                <div className="text-xs text-muted-foreground">Atrasadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {todayTasks.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{todayTasks.length}</div>
                <div className="text-xs text-muted-foreground">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Rate */}
      {allTasks.length > 0 && (
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Taxa de Conclusão</div>
                <div className="text-2xl font-semibold">{completionRate}%</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {completedTasks.length}/{allTasks.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}