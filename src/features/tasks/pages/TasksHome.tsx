import { TaskListContainer } from '@/components/tasks/TaskListContainer';

export function TasksHome() {
  return (
    <div className="flex h-full" data-testid="sidebar">
      <TaskListContainer />
    </div>
  );
}