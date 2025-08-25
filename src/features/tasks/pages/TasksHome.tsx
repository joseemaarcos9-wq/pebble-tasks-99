import { TaskListContainer } from '@/components/tasks/TaskListContainer';
import { QuickActions } from '@/components/QuickActions';

export function TasksHome() {
  return (
    <div className="flex-1 h-full p-6">
      <QuickActions />
      <TaskListContainer />
    </div>
  );
}