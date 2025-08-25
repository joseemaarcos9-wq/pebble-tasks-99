import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUiStore } from '@/features/ui/store';
import {
  Home,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  PiggyBank,
  Repeat,
  Settings,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

export function WorkspaceSidebar() {
  const { section, go } = useUiStore();

  const financeItems = [
    {
      title: "Dashboard",
      icon: Home,
      section: "finance.dashboard" as const,
    },
    {
      title: "Transações",
      icon: DollarSign,
      section: "finance.transactions" as const,
    },
    {
      title: "Contas",
      icon: CreditCard,
      section: "finance.accounts" as const,
    },
    {
      title: "Categorias",
      icon: FolderOpen,
      section: "finance.categories" as const,
    },
    {
      title: "Orçamentos",
      icon: PiggyBank,
      section: "finance.budgets" as const,
    },
    {
      title: "Recorrências",
      icon: Repeat,
      section: "finance.recurring" as const,
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      section: "finance.reports" as const,
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Finanças</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => go(item.section)}
                    isActive={section === item.section}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => go('settings')}
                  isActive={section === 'settings'}
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}