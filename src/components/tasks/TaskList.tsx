import { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { List, Columns } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

import { format, isToday, isPast, isTomorrow, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TaskList() {
  const { tasks: { getFilteredTasks, filters } } = useData();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [viewingTask, setViewingTask] = useState<Task | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  const tasks = getFilteredTasks();

  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {
      'Atrasadas': [],
      'Hoje': [],
      'Amanhã': [],
      'Esta Semana': [],
      'Sem Prazo': [],
      'Outras': [],
    };

    tasks.forEach((task) => {
      if (!task.due_date) {
        groups['Sem Prazo'].push(task);
        return;
      }

      const dueDate = new Date(task.due_date);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        groups['Atrasadas'].push(task);
      } else if (isToday(dueDate)) {
        groups['Hoje'].push(task);
      } else if (isTomorrow(dueDate)) {
        groups['Amanhã'].push(task);
      } else if (isThisWeek(dueDate)) {
        groups['Esta Semana'].push(task);
      } else {
        groups['Outras'].push(task);
      }
    });

    return Object.entries(groups).filter(([_, tasks]) => tasks.length > 0);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setIsTaskViewOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleCloseViewDialog = () => {
    setIsTaskViewOpen(false);
    setViewingTask(undefined);
  };

  const handleEditFromView = () => {
    if (viewingTask) {
      setEditingTask(viewingTask);
      setIsTaskDialogOpen(true);
      setIsTaskViewOpen(false);
      setViewingTask(undefined);
    }
  };

  if (tasks.length === 0) {
    return null; // EmptyState is now handled by TaskListContainer
  }

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <>
      {/* View Mode Toggle */}
      <div className="mb-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'kanban')}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Kanban
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            {/* Task Groups */}
            <div className="space-y-8">
              {groupedTasks.map(([groupName, groupTasks]) => (
                <div key={groupName} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-foreground">
                      {groupName}
                    </h2>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {groupTasks.length}
                    </Badge>
                    {groupName === 'Atrasadas' && (
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                    )}
                    {groupName === 'Hoje' && (
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onEdit={handleEditTask}
                        onView={handleViewTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="kanban" className="mt-6">
            <div className="text-center text-muted-foreground py-8">
              Vista Kanban em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </>
  );
}