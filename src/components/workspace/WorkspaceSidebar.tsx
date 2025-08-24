import { 
  CheckSquare, 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Repeat, 
  Wallet,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { useUiStore, Section } from '@/features/ui/store';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTaskStore } from '@/store/useTaskStore';
import { ListDialog } from '@/components/tasks/ListDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  section: Section;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

const taskItems: NavItem[] = [
  { title: 'Tarefas', section: 'tasks.home', icon: CheckSquare, shortcut: 'G T' }
];

const financeItems: NavItem[] = [
  { title: 'Dashboard', section: 'finance.dashboard', icon: BarChart3, shortcut: 'G F D' },
  { title: 'Transações', section: 'finance.transactions', icon: DollarSign, shortcut: 'G F T' },
  { title: 'Orçamentos', section: 'finance.budgets', icon: CreditCard },
  { title: 'Recorrências', section: 'finance.recurring', icon: Repeat },
  { title: 'Contas', section: 'finance.accounts', icon: Wallet }
];

const otherItems: NavItem[] = [
  { title: 'Configurações', section: 'settings', icon: SettingsIcon }
];

function NavGroup({ 
  label, 
  items, 
  testId 
}: { 
  label: string; 
  items: NavItem[]; 
  testId: string;
}) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { section, go } = useUiStore();

  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = section === item.section;
            
            return (
              <SidebarMenuItem key={item.section}>
                <SidebarMenuButton
                  onClick={() => go(item.section)}
                  className={cn(
                    "transition-colors duration-150",
                    isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "hover:bg-muted/50"
                  )}
                  data-testid={testId}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.shortcut && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function WorkspaceSidebar() {
  const { lists } = useTaskStore();
  const { section } = useUiStore();
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  
  const isTasksSection = section.startsWith('tasks');
  const isFinanceSection = section.startsWith('finance');

  return (
    <Sidebar className="border-r" data-testid="sidebar">
      <SidebarContent className="py-4">
        {/* Seção de Tarefas - só aparece quando estiver em tarefas */}
        {isTasksSection && (
          <>
            <NavGroup 
              label="Tarefas" 
              items={taskItems} 
              testId="nav-tasks"
            />
            
            {/* Lists Section - só para tarefas */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between">
                Listas
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsListDialogOpen(true)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-3 w-3 rotate-45" />
                </Button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {lists.length === 0 ? (
                    <SidebarMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => setIsListDialogOpen(true)}
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                      >
                        <ChevronRight className="h-4 w-4 rotate-45 mr-2" />
                        Criar primeira lista
                      </Button>
                    </SidebarMenuItem>
                  ) : (
                    lists.map((list) => (
                      <SidebarMenuItem key={list.id}>
                        <SidebarMenuButton className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: list.color || '#6b7280' }}
                          />
                          <span className="flex-1 truncate">{list.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {/* Seção Financeira - só aparece quando estiver em finanças */}
        {isFinanceSection && (
          <NavGroup 
            label="Financeiro" 
            items={financeItems} 
            testId="nav-finance"
          />
        )}
        
        {/* Sistema - sempre aparece */}
        <NavGroup 
          label="Sistema" 
          items={otherItems} 
          testId="nav-settings"
        />
      </SidebarContent>
      
      {/* Dialog só aparece na seção de tarefas */}
      {isTasksSection && (
        <ListDialog
          isOpen={isListDialogOpen}
          onClose={() => setIsListDialogOpen(false)}
        />
      )}
    </Sidebar>
  );
}