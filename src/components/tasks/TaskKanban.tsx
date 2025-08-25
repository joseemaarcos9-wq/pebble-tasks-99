import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Calendar, 
  Paperclip,
  Plus,
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onCreateTask: (status?: string) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  headerColor: string;
  bgColor: string;
  limit?: number;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'backlog',
    color: 'border-slate-200',
    headerColor: 'text-slate-700',
    bgColor: 'bg-slate-50/50',
  },
  {
    id: 'todo',
    title: 'A Fazer',
    status: 'todo',
    color: 'border-blue-200',
    headerColor: 'text-blue-700',
    bgColor: 'bg-blue-50/50',
  },
  {
    id: 'in_progress',
    title: 'Em Progresso',
    status: 'in_progress',
    color: 'border-amber-200',
    headerColor: 'text-amber-700',
    bgColor: 'bg-amber-50/50',
    limit: 3,
  },
  {
    id: 'review',
    title: 'Revisão',
    status: 'review',
    color: 'border-purple-200',
    headerColor: 'text-purple-700',
    bgColor: 'bg-purple-50/50',
  },
  {
    id: 'done',
    title: 'Concluído',
    status: 'done',
    color: 'border-emerald-200',
    headerColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50/50',
  },
];

function TaskCard({ task, onTaskClick, onTaskEdit, onTaskDelete }: {
  task: Task;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'concluida';

  return (
    <Card 
      className={`group cursor-pointer bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${
        isOverdue ? 'border-red-200 bg-red-50/30' : ''
      }`}
      onClick={() => onTaskClick(task)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-4">
        {/* Header com prioridade e ações */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
              title={`Prioridade: ${task.priority}`}
            />
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                console.log('View clicked for task:', task.title);
                onTaskClick(task);
              }}
              title="Visualizar"
            >
              <Eye className="h-3 w-3 text-blue-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-orange-100"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Edit clicked for task:', task.title);
                onTaskEdit(task);
              }}
              title="Editar"
            >
              <Edit className="h-3 w-3 text-orange-600" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskDelete(task.id);
                  }}
                  className="text-xs text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Título */}
        <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Descrição */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700"
              >
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Data de vencimento */}
          {task.due_date ? (
            <div className={`flex items-center gap-1.5 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Sem prazo</span>
            </div>
          )}

          {/* Link indicator */}
          {task.link && (
            <div className="flex items-center">
              <Paperclip className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ 
  column, 
  tasks, 
  onTaskClick, 
  onTaskEdit, 
  onTaskDelete, 
  onCreateTask,
  onTaskStatusChange
}: {
  column: KanbanColumn;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onCreateTask: (status?: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const columnTasks = tasks.filter(task => {
    return task.kanban_status === column.status;
  });

  const isOverLimit = column.limit && columnTasks.length > column.limit;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskStatusChange(taskId, column.status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-col w-80 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header da coluna */}
      <div className={`${column.bgColor} px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm ${column.headerColor}`}>
              {column.title}
            </h3>
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium ${
                isOverLimit 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'bg-white/70 text-gray-600 border-gray-300'
              }`}
            >
              {columnTasks.length}
              {column.limit && `/${column.limit}`}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/50"
            onClick={() => onCreateTask(column.status)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {column.limit && (
          <div className="text-xs text-gray-500 mt-1">
            Limite: {column.limit} tarefas
          </div>
        )}
      </div>

      {/* Lista de tarefas */}
      <div 
        className={`flex-1 p-3 space-y-3 min-h-96 max-h-[calc(100vh-200px)] overflow-y-auto ${
          isDragOver ? 'bg-blue-50' : column.bgColor
        } transition-colors duration-200`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {columnTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm text-center mb-3">
              Nenhuma tarefa
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 hover:bg-white/50"
              onClick={() => onCreateTask(column.status)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar tarefa
            </Button>
          </div>
        ) : (
          columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TaskKanban({
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onCreateTask,
}: TaskKanbanProps) {
  return (
    <div className="h-full bg-gray-50/30 p-6">
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onCreateTask={onCreateTask}
            onTaskStatusChange={onTaskStatusChange}
          />
        ))}
      </div>
    </div>
  );
}