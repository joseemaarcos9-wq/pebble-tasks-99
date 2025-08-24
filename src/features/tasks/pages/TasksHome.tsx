import { QuickActions } from '@/components/QuickActions';
import { TaskListContainer } from '@/components/tasks/TaskListContainer';

export function TasksHome() {
  return (
    <div className="flex-1 h-full p-6">
      <QuickActions />
      <TaskListContainer />
    </div>
  );
}