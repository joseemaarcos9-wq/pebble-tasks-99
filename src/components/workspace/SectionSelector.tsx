import { LayoutList, Wallet, LayoutDashboard } from 'lucide-react';
import { useUiStore } from '@/features/ui/store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SectionSelector() {
  const { section, go } = useUiStore();
  
  const isTasksActive = section.startsWith('tasks');
  const isFinanceActive = section.startsWith('finance');

  return (
    <TooltipProvider>
      <div 
        className="flex items-center bg-muted rounded-lg p-1"
        data-testid="topbar-section-switch"
      >
        {/* Tasks Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isTasksActive ? "default" : "ghost"}
              size="sm"
              onClick={() => go('tasks.home')}
              className="h-8 gap-2 text-sm font-medium"
              aria-label="Ir para Tarefas"
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Tarefas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alternar para Tarefas (g t)</p>
          </TooltipContent>
        </Tooltip>

        {/* Finance Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFinanceActive ? "default" : "ghost"}
              size="sm"
              onClick={() => go('finance.dashboard')}
              className="h-8 gap-2 text-sm font-medium"
              aria-label="Ir para Financeiro"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alternar para Financeiro (g f)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}