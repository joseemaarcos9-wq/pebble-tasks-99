import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Calendar, 
  Flag, 
  Eye, 
  Edit, 
  Trash2,
  List,
  LayoutGrid,
  Filter,
  Search,
  Columns
} from 'lucide-react';
import { Task, TaskFilters as TaskFiltersType } from '@/hooks/useTasks';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskFilters } from './TaskFilters';
import { TaskKanban } from './TaskKanban';
import { TaskDialog } from './TaskDialog';
import { TaskDetailView } from './TaskDetailView';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskView: (task: Task) => void;
}

export function TaskList({ tasks, onTaskEdit, onTaskView }: TaskListProps) {
  const { tasks: { updateTask, deleteTask, addTask } } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: '',
    status: 'all',
    listId: undefined,
    priority: undefined,
    dateRange: undefined,
    tags: [],
  });
  
  // Filtrar tarefas baseado nos filtros aplicados
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (filters.status !== 'all') {
        if (filters.status === 'pending' && task.status !== 'pendente') return false;
        if (filters.status === 'completed' && task.status !== 'concluida') return false;
      }

      // Filtro de lista
      if (filters.listId && task.list_id !== filters.listId) return false;

      // Filtro de prioridade
      if (filters.priority && task.priority !== filters.priority) return false;

      // Filtro de período
      if (filters.dateRange) {
        const now = new Date();
        const taskDate = task.due_date ? new Date(task.due_date) : null;
        
        switch (filters.dateRange) {
          case 'today':
            if (!taskDate || !isToday(taskDate)) return false;
            break;
          case 'week':
            if (!taskDate || !isThisWeek(taskDate)) return false;
            break;
          case 'overdue':
            if (!taskDate || !isPast(taskDate) || task.status === 'concluida') return false;
            break;
        }
      }

      // Filtro de tags
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag => 
          task.tags?.includes(filterTag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const handleTaskToggle = useCallback(async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { 
        status: completed ? 'concluida' : 'pendente',
        completed_at: completed ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  }, [updateTask]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { 
        status: status as 'pendente' | 'concluida',
        completed_at: status === 'concluida' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  }, [updateTask]);

  const handleKanbanStatusChange = useCallback(async (taskId: string, kanbanStatus: string) => {
    await updateTask(taskId, { kanban_status: kanbanStatus as 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' });
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  }, [deleteTask]);

  const handleCreateTask = useCallback((kanbanStatus?: string) => {
    setSelectedTask(null);
    // Se uma coluna específica do kanban foi especificada, criar uma tarefa com esse status
    if (kanbanStatus) {
      setSelectedTask({
        kanban_status: kanbanStatus as 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
      } as Task);
    }
    setTaskDialogOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Partial<TaskFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      listId: undefined,
      priority: undefined,
      dateRange: undefined,
      tags: [],
    });
  }, []);

  const groupedTasks = useMemo(() => {
    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      noDueDate: [] as Task[],
      others: [] as Task[],
    };

    filteredTasks.forEach((task) => {
      if (!task.due_date) {
        groups.noDueDate.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);
      
      if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'concluida') {
        groups.overdue.push(task);
      } else if (isToday(dueDate)) {
        groups.today.push(task);
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.push(task);
      } else if (isThisWeek(dueDate)) {
        groups.thisWeek.push(task);
      } else {
        groups.others.push(task);
      }
    });

    return groups;
  }, [filteredTasks]);
  
  const handleTaskEdit = useCallback((task: Task) => {
    console.log('handleTaskEdit called with task:', task.title);
    setSelectedTask(task);
    setTaskDialogOpen(true);
  }, []);

  const handleTaskView = (task: Task) => {
    setViewingTask(task);
    setIsTaskViewOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleCloseViewDialog = () => {
    setIsTaskViewOpen(false);
    setViewingTask(undefined);
  };

  const handleEditFromView = () => {
    if (viewingTask) {
      setEditingTask(viewingTask);
      setIsTaskDialogOpen(true);
      setIsTaskViewOpen(false);
      setViewingTask(undefined);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tarefas</h2>
        <div className="flex items-center gap-4">
          {/* Botão de filtros */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {(filters.search || filters.status !== 'all' || filters.listId || filters.priority || filters.dateRange || filters.tags.length > 0) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                !
              </Badge>
            )}
          </Button>
          
          {/* Controles de visualização */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="flex items-center gap-2"
            >
              <Columns className="h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Conteúdo principal */}
       {viewMode === 'list' ? (
         <div className="space-y-6">
           {/* Tarefas Atrasadas */}
           {groupedTasks.overdue.length > 0 && (
             <TaskGroup
               title="Atrasadas"
               tasks={groupedTasks.overdue}
               color="text-red-600"
               bgColor="bg-red-50"
               onTaskToggle={handleTaskToggle}
               onTaskEdit={handleTaskEdit}
               onTaskView={handleTaskClick}
             />
           )}

           {/* Tarefas de Hoje */}
           {groupedTasks.today.length > 0 && (
             <TaskGroup
               title="Hoje"
               tasks={groupedTasks.today}
               color="text-blue-600"
               bgColor="bg-blue-50"
               onTaskToggle={handleTaskToggle}
               onTaskEdit={handleTaskEdit}
               onTaskView={handleTaskClick}
             />
           )}

           {/* Tarefas de Amanhã */}
           {groupedTasks.tomorrow.length > 0 && (
             <TaskGroup
               title="Amanhã"
               tasks={groupedTasks.tomorrow}
               color="text-green-600"
               bgColor="bg-green-50"
               onTaskToggle={handleTaskToggle}
               onTaskEdit={handleTaskEdit}
               onTaskView={handleTaskClick}
             />
           )}

           {/* Tarefas desta Semana */}
           {groupedTasks.thisWeek.length > 0 && (
             <TaskGroup
               title="Esta Semana"
               tasks={groupedTasks.thisWeek}
               color="text-purple-600"
               bgColor="bg-purple-50"
               onTaskToggle={handleTaskToggle}
               onTaskEdit={handleTaskEdit}
               onTaskView={handleTaskClick}
             />
           )}

            {/* Tarefas sem Data */}
            {groupedTasks.noDueDate.length > 0 && (
              <TaskGroup
                title="Sem Data de Vencimento"
                tasks={groupedTasks.noDueDate}
                color="text-muted-foreground"
                bgColor="bg-muted"
                onTaskToggle={handleTaskToggle}
                onTaskEdit={handleTaskEdit}
                onTaskView={handleTaskClick}
              />
            )}

            {/* Outras Tarefas */}
            {groupedTasks.others.length > 0 && (
              <TaskGroup
                title="Outras"
                tasks={groupedTasks.others}
                color="text-muted-foreground"
                bgColor="bg-muted"
                onTaskToggle={handleTaskToggle}
                onTaskEdit={handleTaskEdit}
                onTaskView={handleTaskClick}
              />
            )}

           {filteredTasks.length === 0 && (
             <Card>
               <CardContent className="p-8 text-center">
                 <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
               </CardContent>
             </Card>
           )}
         </div>
       ) : (
         <TaskKanban
           tasks={filteredTasks}
           onTaskClick={handleTaskClick}
           onTaskEdit={handleTaskEdit}
           onTaskDelete={handleTaskDelete}
           onTaskStatusChange={handleKanbanStatusChange}
           onCreateTask={handleCreateTask}
         />
       )}

      {/* Diálogos */}
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          task={selectedTask}
          mode={selectedTask ? 'edit' : 'create'}
        />

        <TaskDetailView
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          task={selectedTask}
        />

     </div>
   );
 }

// Componente TaskGroup para agrupar tarefas
function TaskGroup({ 
  title, 
  tasks, 
  color, 
  bgColor, 
  onTaskToggle, 
  onTaskEdit, 
  onTaskView 
}: {
  title: string;
  tasks: Task[];
  color: string;
  bgColor: string;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskEdit: (task: Task) => void;
  onTaskView: (task: Task) => void;
}) {
  return (
    <Card className={bgColor}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <CardTitle className={`text-lg ${color}`}>{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onTaskToggle}
            onEdit={onTaskEdit}
            onView={onTaskView}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// Componente TaskItem para exibir uma tarefa individual
function TaskItem({ 
  task, 
  onToggle, 
  onEdit, 
  onView 
}: {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-destructive';
      case 'alta': return 'text-accent';
      case 'media': return 'text-muted-foreground';
      case 'baixa': return 'text-muted-foreground/60';
      default: return 'text-muted-foreground';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'concluida';

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:shadow-sm transition-shadow">
      <Checkbox
        checked={task.status === 'concluida'}
        onCheckedChange={(checked) => onToggle(task.id, !!checked)}
      />
      
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(task)}>
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium text-sm truncate ${
            task.status === 'concluida' ? 'line-through text-muted-foreground' : ''
          }`}>
            {task.title}
          </h4>
          <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground truncate">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {task.due_date && (
            <div className={`flex items-center gap-1 ${
              isOverdue ? 'text-red-600' : ''
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                {isOverdue && ' (Atrasada)'}
              </span>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(task)}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}