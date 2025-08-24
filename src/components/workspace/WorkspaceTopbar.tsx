import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';
import { useUiStore, Section } from '@/features/ui/store';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspaceKeyboardShortcuts } from '@/hooks/useWorkspaceKeyboardShortcuts';
import { useTaskStore } from '@/store/useTaskStore';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandMenu } from './CommandMenu';
import { SectionSelector } from './SectionSelector';
import { TopbarActions } from './TopbarActions';

const sectionTitles: Record<Section, string> = {
  'tasks.home': 'Tarefas',
  'tasks.detail': 'Detalhes da Tarefa',
  'finance.dashboard': 'Dashboard Financeiro',
  'finance.transactions': 'Transações',
  'finance.budgets': 'Orçamentos',
  'finance.recurring': 'Recorrências',
  'finance.accounts': 'Contas',
  'settings': 'Configurações'
};

export function WorkspaceTopbar() {
  const { section, history, back, go } = useUiStore();
  const { theme, setTheme } = useTheme();
  const { keySequence } = useWorkspaceKeyboardShortcuts();
  const { getFilteredTasks, filters } = useTaskStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Command Menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      // Search focus
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // New task shortcut (when in tasks section)
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey && section.startsWith('tasks')) {
        e.preventDefault();
        setNewTaskOpen(true);
        return;
      }

      // History navigation
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [back, setCommandOpen, section, setNewTaskOpen]);

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;
  
  // Get dynamic title and count for tasks section
  const getTaskTitle = () => {
    if (!section.startsWith('tasks')) return sectionTitles[section] || 'Workspace';
    
    if (filters.dateRange === 'today') return 'Hoje';
    if (filters.dateRange === 'overdue') return 'Atrasadas';
    if (filters.dateRange === 'week') return 'Esta Semana';
    if (filters.listId) {
      // Would need access to lists here - simplified for now
      return 'Lista Personalizada';
    }
    if (filters.status === 'pending') return 'Tarefas Pendentes';
    if (filters.status === 'completed') return 'Tarefas Concluídas';
    if (filters.search) return `Busca: "${filters.search}"`;
    return 'Todas as Tarefas';
  };
  
  const getTaskCount = () => {
    if (section.startsWith('tasks')) {
      return getFilteredTasks().length;
    }
    return null;
  };

  return (
    <>
      <header 
        className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6"
        data-testid="topbar"
      >
        <div className="flex items-center gap-6">
          <SidebarTrigger />
          
          {/* Section Selector */}
          <SectionSelector />
          
          {/* Title with counter */}
          <div className="flex items-center gap-3" data-testid="title-count">
            <h1 className="text-lg font-semibold">
              {section.startsWith('tasks') ? getTaskTitle() : (sectionTitles[section] || 'Workspace')}
            </h1>
            
            {/* Task counter badge */}
            {section.startsWith('tasks') && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {getTaskCount()}
              </Badge>
            )}
            
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                className="gap-2 text-muted-foreground hover:text-foreground"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {keySequence && (
            <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
              {keySequence}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <TopbarActions
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onCommandOpen={() => setCommandOpen(true)}
            onNewTask={section.startsWith('tasks') ? () => setNewTaskOpen(true) : undefined}
          />

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Alterar tema">
                <ThemeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('auto')}>
                <Monitor className="h-4 w-4 mr-2" />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      
      {/* Global Task Dialog triggered from topbar */}
      {section.startsWith('tasks') && (
        <div style={{ display: 'none' }}>
          <div data-new-task-trigger={newTaskOpen} />
        </div>
      )}
    </>
  );
}