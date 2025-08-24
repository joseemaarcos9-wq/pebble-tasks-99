import { useTaskStore } from '@/store/useTaskStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskProgressProps {
  listId?: string;
  className?: string;
}

/**
 * Componente de progresso das tarefas
 * Mostra estatísticas visuais do progresso das tarefas
 */
export function TaskProgress({ listId, className }: TaskProgressProps) {
  const { getTaskProgress, getOverdueTasks, getTodayTasks } = useTaskStore();
  
  const progress = getTaskProgress(listId);
  const overdueTasks = getOverdueTasks();
  const todayTasks = getTodayTasks();

  if (progress.total === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra de progresso principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {progress.completed}/{progress.total} ({progress.percentage}%)
          </span>
        </div>
        <Progress 
          value={progress.percentage} 
          className="h-2"
        />
      </div>

      {/* Métricas rápidas */}
      <div className="flex items-center space-x-4 text-xs">
        {/* Tarefas concluídas */}
        <div className="flex items-center space-x-1">
          <CheckSquare className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">
            {progress.completed} concluídas
          </span>
        </div>

        {/* Tarefas de hoje */}
        {todayTasks.length > 0 && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-accent" />
            <span className="text-muted-foreground">
              {todayTasks.length} hoje
            </span>
          </div>
        )}

        {/* Tarefas atrasadas */}
        {overdueTasks.length > 0 && (
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span className="text-muted-foreground">
              {overdueTasks.length} atrasadas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}