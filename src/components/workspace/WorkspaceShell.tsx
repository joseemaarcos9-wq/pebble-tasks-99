import { SidebarProvider } from '@/components/ui/sidebar';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { TaskSidebar } from '@/components/tasks/TaskSidebar';
import { WorkspaceTopbar } from './WorkspaceTopbar';
import { SectionRenderer } from '../SectionRenderer';
import { useUiStore } from '@/features/ui/store';

export function WorkspaceShell() {
  const { section } = useUiStore();
  
  // Determina qual sidebar usar baseado na seção atual
  const isTasksSection = section.startsWith('tasks');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" data-testid="workspace-shell">
        {/* Sidebar contextual - Tasks usa TaskSidebar, outros usam WorkspaceSidebar */}
        {isTasksSection ? <TaskSidebar /> : <WorkspaceSidebar />}
        
        <div className="flex-1 flex flex-col">
          <WorkspaceTopbar />
          
          <main className="flex-1 overflow-auto">
            <SectionRenderer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}