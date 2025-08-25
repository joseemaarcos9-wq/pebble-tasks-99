import { useState, useEffect } from 'react';
import { TaskList } from './TaskList';
import { SimpleTaskDialog } from './SimpleTaskDialog';
import { TaskDialog } from './TaskDialog';
import { TaskDetailView } from './TaskDetailView';

import { useData } from '@/components/providers/DataProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/hooks/useTasks';

/**
 * Container principal para a lista de tarefas
 * Gerencia estado vazio, filtros ativos e exibição da lista
 */
export function TaskListContainer() {
  const { tasks } = useData();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  const handleTaskCreate = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskView = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleTaskDialogClose = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDetailClose = (open: boolean) => {
    setTaskDetailOpen(open);
    if (!open) {
      setSelectedTask(null);
    }
  };
  
  return (
    <div className="flex-1">
      <TaskList 
        tasks={tasks.tasks}
        onTaskEdit={handleTaskEdit}
        onTaskView={handleTaskView}
      />
      
      {/* Task Dialog */}
      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={handleTaskDialogClose}
        task={selectedTask}
        mode={selectedTask ? 'edit' : 'create'}
      />
      
      {/* Task Detail View */}
      <TaskDetailView
        open={taskDetailOpen}
        onOpenChange={handleTaskDetailClose}
        task={selectedTask}
      />
      
      {/* Simple Task Dialog for quick creation */}
      <SimpleTaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
      />
    </div>
  );
}