import { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { seedTasks, seedLists } from '@/store/seedData';
import { TaskHeader } from '@/components/tasks/TaskHeader';
import { TaskSidebar } from '@/components/tasks/TaskSidebar';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';

export default function Dashboard() {
  const { tasks, lists, addTask, addList, setFilters, restoreTask } = useTaskStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  useTheme();

  // Atalhos de teclado com funcionalidade de undo

  useKeyboardShortcuts({
    onNewTask: () => setIsTaskDialogOpen(true),
    onSearch: () => {
      // A função focusSearch já é gerenciada pelo TaskHeader
    },
    onToggleList: (index) => {
      if (lists[index]) {
        setFilters({ listId: lists[index].id });
      }
    },
    onUndo: () => {
      restoreTask(); // Desfaz a última exclusão
    },
  });

  // Initialize with seed data if empty
  useEffect(() => {
    if (lists.length === 0) {
      seedLists.forEach((list) => addList(list.name, list.color));
    }
    if (tasks.length === 0) {
      seedTasks.forEach((task) => {
        addTask({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          listId: task.listId,
          tags: task.tags,
          dueDate: task.dueDate,
          subtasks: task.subtasks,
          link: task.link,
          photos: [],
        });
      });
    }
  }, [lists.length, tasks.length, addList, addTask]);

  return (
    <>
      <SidebarProvider defaultOpen>
        <div className="min-h-screen flex w-full">
          <TaskSidebar />
          <div className="flex-1 flex flex-col">
            <TaskHeader />
            <main className="flex-1 p-6">
              <TaskList />
            </main>
          </div>
        </div>
      </SidebarProvider>
      
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
      />
    </>
  );
}