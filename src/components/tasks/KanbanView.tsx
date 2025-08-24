import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskDialog } from './TaskDialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { Task, Priority } from '@/store/types';
import { cn } from '@/lib/utils';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface KanbanViewProps {
  onViewTask: (task: Task) => void;
}

export function KanbanView({ onViewTask }: KanbanViewProps) {
  const { getFilteredTasks, updateTask } = useTaskStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  const tasks = getFilteredTasks();

  // Agrupa tarefas por prioridade
  const columns: KanbanColumn[] = [
    {
      id: 'urgente',
      title: 'Urgente',
      color: 'border-red-500 bg-red-50/50',
      tasks: tasks.filter(task => task.priority === 'urgente')
    },
    {
      id: 'alta',
      title: 'Alta',
      color: 'border-orange-500 bg-orange-50/50',
      tasks: tasks.filter(task => task.priority === 'alta')
    },
    {
      id: 'media',
      title: 'Média',
      color: 'border-yellow-500 bg-yellow-50/50',
      tasks: tasks.filter(task => task.priority === 'media')
    },
    {
      id: 'baixa',
      title: 'Baixa',
      color: 'border-green-500 bg-green-50/50',
      tasks: tasks.filter(task => task.priority === 'baixa')
    }
  ];

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    updateTask(taskId, { priority });
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-6 px-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Priority)}
          >
            <div className="bg-muted/30 rounded-xl p-3 min-h-[600px]">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-semibold text-foreground/90">
                  {column.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {column.tasks.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => setIsTaskDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="cursor-move"
                  >
                    <div className="bg-card rounded-lg border border-border/50 p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border group">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-card-foreground leading-5 line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onViewTask(task)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditTask(task)}
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {task.dueDate && (
                              <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                new Date(task.dueDate) < new Date() 
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {new Date(task.dueDate).toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit' 
                                })}
                              </span>
                            )}
                          </div>
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 bg-accent/20 text-accent-foreground rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="text-muted-foreground">
                                  +{task.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    Arraste tarefas aqui
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground text-sm py-2 h-auto"
                  onClick={() => setIsTaskDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar tarefa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={handleCloseDialog}
        task={editingTask}
      />
    </>
  );
}