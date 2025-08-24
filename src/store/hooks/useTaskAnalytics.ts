import { useTaskStore } from '../useTaskStore';
import { Task, Priority } from '../types';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  format,
  isWithinInterval,
  differenceInDays,
  eachDayOfInterval,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Hook para analytics e relatórios de tarefas
 */
export function useTaskAnalytics() {
  const { tasks, lists } = useTaskStore();

  const getProductivityMetrics = (dateRange: 'week' | 'month' = 'week') => {
    const now = new Date();
    const start = dateRange === 'week' ? startOfWeek(now, { locale: ptBR }) : startOfMonth(now);
    const end = dateRange === 'week' ? endOfWeek(now, { locale: ptBR }) : endOfMonth(now);

    const tasksInRange = tasks.filter(task => 
      task.createdAt && isWithinInterval(task.createdAt, { start, end })
    );

    const completedInRange = tasksInRange.filter(task => 
      task.status === 'concluida' && 
      task.completedAt && 
      isWithinInterval(task.completedAt, { start, end })
    );

    const totalTasks = tasksInRange.length;
    const completed = completedInRange.length;
    const completionRate = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

    // Distribuição por prioridade
    const priorityDistribution = tasksInRange.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    // Tarefas por dia
    const dailyTasks = eachDayOfInterval({ start, end }).map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const created = tasksInRange.filter(task => 
        task.createdAt && isWithinInterval(task.createdAt, { start: dayStart, end: dayEnd })
      ).length;
      
      const completed = completedInRange.filter(task => 
        task.completedAt && isWithinInterval(task.completedAt, { start: dayStart, end: dayEnd })
      ).length;

      return {
        date: format(date, 'dd/MM'),
        created,
        completed
      };
    });

    return {
      totalTasks,
      completed,
      pending: totalTasks - completed,
      completionRate: Math.round(completionRate),
      priorityDistribution,
      dailyTasks,
      averageTasksPerDay: Math.round(totalTasks / dailyTasks.length)
    };
  };

  const getListAnalytics = () => {
    return lists.map(list => {
      const listTasks = tasks.filter(task => task.listId === list.id);
      const completed = listTasks.filter(task => task.status === 'concluida').length;
      const total = listTasks.length;
      
      return {
        id: list.id,
        name: list.name,
        color: list.color,
        total,
        completed,
        pending: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  };

  const getOverdueAnalytics = () => {
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.status === 'pendente' && 
      task.dueDate && 
      new Date(task.dueDate) < now
    );

    const overdueByDays = overdueTasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      
      const daysOverdue = differenceInDays(now, new Date(task.dueDate));
      const range = daysOverdue <= 7 ? '1-7' : 
                   daysOverdue <= 30 ? '8-30' : '30+';
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: overdueTasks.length,
      byDaysRange: overdueByDays,
      byPriority: overdueTasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<Priority, number>)
    };
  };

  const getTagAnalytics = () => {
    const tagFrequency = tasks.reduce((acc, task) => {
      task.tags.forEach(tag => {
        if (!acc[tag]) {
          acc[tag] = { count: 0, completed: 0 };
        }
        acc[tag].count++;
        if (task.status === 'concluida') {
          acc[tag].completed++;
        }
      });
      return acc;
    }, {} as Record<string, { count: number; completed: number }>);

    return Object.entries(tagFrequency)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        completed: data.completed,
        completionRate: Math.round((data.completed / data.count) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getTimeToCompleteMetrics = () => {
    const completedTasks = tasks.filter(task => 
      task.status === 'concluida' && task.completedAt && task.createdAt
    );

    const completionTimes = completedTasks.map(task => {
      const created = new Date(task.createdAt);
      const completed = new Date(task.completedAt!);
      return differenceInDays(completed, created);
    });

    if (completionTimes.length === 0) {
      return {
        averageDays: 0,
        medianDays: 0,
        fastest: 0,
        slowest: 0
      };
    }

    const sorted = completionTimes.sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      averageDays: Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length),
      medianDays: Math.round(median),
      fastest: sorted[0],
      slowest: sorted[sorted.length - 1]
    };
  };

  const exportAnalytics = () => {
    const metrics = getProductivityMetrics();
    const listAnalytics = getListAnalytics();
    const overdueAnalytics = getOverdueAnalytics();
    const tagAnalytics = getTagAnalytics();
    const timeMetrics = getTimeToCompleteMetrics();

    return {
      exportDate: new Date().toISOString(),
      productivity: metrics,
      lists: listAnalytics,
      overdue: overdueAnalytics,
      tags: tagAnalytics,
      timeToComplete: timeMetrics,
      summary: {
        totalTasks: tasks.length,
        totalCompleted: tasks.filter(t => t.status === 'concluida').length,
        totalLists: lists.length,
        totalTags: tagAnalytics.length
      }
    };
  };

  return {
    getProductivityMetrics,
    getListAnalytics,
    getOverdueAnalytics,
    getTagAnalytics,
    getTimeToCompleteMetrics,
    exportAnalytics
  };
}