import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/components/providers/DataProvider';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { ListDialog } from './ListDialog';

import { 
  Inbox, 
  Calendar, 
  AlertCircle, 
  CheckSquare, 
  Tag,
  Hash,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Zap,
  Clock,
  Star,
  BookOpen,
  Coffee,
  Home,
  Briefcase,
  Heart,
  Users
} from 'lucide-react';

export function TaskSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isCustomViewDialogOpen, setIsCustomViewDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editingCustomView, setEditingCustomView] = useState<string | null>(null);
  const { filters, updateFilters, clearFilters } = useTaskFilters();
  const { 
    tasks: {
      lists, 
      customViews,
      getTasksByList, 
      tasks,
      getAllTags,
      getFilteredTasks,
      deleteList,
      deleteCustomView
    }
  } = useData();

  // Calculate task counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = tasks.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date) < today
  );
  
  const todayTasks = tasks.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date).toDateString() === today.toDateString()
  );
  
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  const weekTasks = tasks.filter(
    (task) =>
      task.status === 'pendente' &&
      task.due_date &&
      new Date(task.due_date) >= today &&
      new Date(task.due_date) <= weekFromNow
  );
  
  const allTags = getAllTags();

  const isActive = (condition: boolean) => condition ? 'bg-accent text-accent-foreground' : '';

  const handleViewChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const handleEditList = (listId: string) => {
    setEditingList(listId);
    setIsListDialogOpen(true);
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta lista? Todas as tarefas da lista também serão excluídas.')) {
      deleteList(listId);
      // Se a lista excluída estava sendo filtrada, limpar o filtro
      if (filters.listId === listId) {
        updateFilters({ listId: undefined });
      }
    }
  };

  const handleCloseDialog = () => {
    setIsListDialogOpen(false);
    setEditingList(null);
  };

  const handleEditCustomView = (viewId: string) => {
    setEditingCustomView(viewId);
    setIsCustomViewDialogOpen(true);
  };

  const handleDeleteCustomView = (viewId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta visualização?')) {
      deleteCustomView(viewId);
    }
  };

  const handleCloseCustomViewDialog = () => {
    setIsCustomViewDialogOpen(false);
    setEditingCustomView(null);
  };

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
      Calendar,
      CheckSquare,
      Clock,
      Star,
      Target,
      Zap,
      BookOpen,
      Coffee,
      Home,
      Briefcase,
      Heart,
      Users,
    };
    return iconMap[iconName] || Target;
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="p-2">
        
        {/* Main Views */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : ''}>
            Visualizações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleViewChange({ status: 'all', listId: undefined, dateRange: undefined })}
                        className={isActive(!filters.listId && !filters.dateRange)}
                      >
                        <Inbox className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span>Todas</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {getFilteredTasks(filters).length}
                            </Badge>
                          </>
                        )}
                      </SidebarMenuButton>
              </SidebarMenuItem>

              {overdueTasks.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleViewChange({ dateRange: 'overdue' })}
                    className={isActive(filters.dateRange === 'overdue')}
                  >
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    {!collapsed && (
                      <>
                        <span>Atrasadas</span>
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {overdueTasks.length}
                        </Badge>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {todayTasks.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleViewChange({ dateRange: 'today' })}
                    className={isActive(filters.dateRange === 'today')}
                  >
                    <Calendar className="h-4 w-4 text-accent" />
                    {!collapsed && (
                      <>
                        <span>Hoje</span>
                        <Badge variant="outline" className="ml-auto text-xs border-accent text-accent">
                          {todayTasks.length}
                        </Badge>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {weekTasks.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleViewChange({ dateRange: 'week' })}
                    className={isActive(filters.dateRange === 'week')}
                  >
                    <Calendar className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span>Esta Semana</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {weekTasks.length}
                        </Badge>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Custom Views */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'flex items-center justify-between'}>
            <span>Visualizações</span>
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomViewDialogOpen(true)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customViews.map((view) => {
                const IconComponent = getIconComponent(view.icon);
                const viewTasks = getFilteredTasks(view.filters);
                
                return (
                  <SidebarMenuItem key={view.id}>
                    <div className="flex items-center group">
                      <SidebarMenuButton 
                        onClick={() => updateFilters(view.filters)}
                        className="flex-1"
                      >
                        <IconComponent 
                          className="h-4 w-4" 
                          style={{ color: view.color }}
                        />
                        {!collapsed && (
                          <>
                            <span className="truncate">{view.name}</span>
                            {viewTasks.length > 0 && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {viewTasks.length}
                              </Badge>
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                      
                      {!collapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCustomView(view.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar visualização
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCustomView(view.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir visualização
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Lists */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : ''}>
            Listas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lists.map((list) => {
                const listTasks = getTasksByList(list.id).filter(task => task.status === 'pendente');
                return (
                  <SidebarMenuItem key={list.id}>
                    <div className="flex items-center group">
                      <SidebarMenuButton 
                        onClick={() => handleViewChange({ listId: list.id, dateRange: undefined })}
                        className={`flex-1 ${isActive(filters.listId === list.id)}`}
                      >
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: list.color || '#6b7280' }}
                        />
                        {!collapsed && (
                          <>
                            <span className="truncate">{list.name}</span>
                            {listTasks.length > 0 && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {listTasks.length}
                              </Badge>
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                      
                      {!collapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditList(list.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar lista
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteList(list.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir lista
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tags */}
        {allTags.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'hidden' : ''}>
              Etiquetas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allTags.slice(0, collapsed ? 3 : 8).map((tag) => (
                  <SidebarMenuItem key={tag}>
                    <SidebarMenuButton 
                      onClick={() => {
                        const newTags = filters.tags.includes(tag) 
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        handleViewChange({ tags: newTags });
                      }}
                      className={isActive(filters.tags.includes(tag))}
                    >
                      <Hash className="h-4 w-4" />
                      {!collapsed && <span className="truncate">{tag}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Status Filter */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : ''}>
            Status
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleViewChange({ status: 'pending' })}
                  className={isActive(filters.status === 'pending')}
                >
                  <CheckSquare className="h-4 w-4" />
                  {!collapsed && <span>Pendentes</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleViewChange({ status: 'completed' })}
                  className={isActive(filters.status === 'completed')}
                >
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  {!collapsed && <span>Concluídas</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer with Add List button */}
        {!collapsed && (
          <div className="mt-auto p-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => setIsListDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar Lista
            </Button>
          </div>
        )}

      </SidebarContent>
      
      <ListDialog
        isOpen={isListDialogOpen}
        onClose={handleCloseDialog}
        editingListId={editingList}
      />
      
    </Sidebar>
  );
}