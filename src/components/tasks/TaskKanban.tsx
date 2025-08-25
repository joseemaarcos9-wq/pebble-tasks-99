import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  User, 
  MessageSquare,
  Paperclip,
  CheckSquare,
  Plus
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useData } from '@/components/providers/DataProvider';
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
  limit?: number;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'backlog',
    color: 'bg-gray-50 border-gray-200',
  },
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    status: 'in_progress',
    color: 'bg-yellow-50 border-yellow-200',
    limit: 3,
  },
  {
    id: 'review',
    title: 'Review',
    status: 'review',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: 'bg-green-50 border-green-200',
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
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgente': return '🔴';
      case 'alta': return '🟠';
      case 'media': return '🟡';
      case 'baixa': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'concluida';
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md group ${
        isOverdue ? 'border-red-300 bg-red-50' : ''
      }`}
      onClick={() => onTaskClick(task)}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        {/* Header com prioridade e menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPriorityIcon(task.priority)}</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onTaskEdit(task);
              }}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskDelete(task.id);
                }}
                className="text-red-600"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Título */}
        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Descrição */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="space-y-2">
          {/* Data de vencimento */}
          {task.due_date && (
            <div className={`flex items-center gap-2 text-xs ${
              isOverdue ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                {isOverdue && ' (Atrasada)'}
              </span>
            </div>
          )}

          {/* Subtarefas */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              <span>{completedSubtasks}/{totalSubtasks} subtarefas</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Anexos e comentários */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>

          {/* Responsável */}
          {task.assigned_to && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{task.assigned_to}</span>
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
  const columnTasks = tasks.filter(task => {
    return task.kanban_status === column.status;
  });

  const isOverLimit = column.limit && columnTasks.length > column.limit;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskStatusChange(taskId, column.status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="flex flex-col h-full min-w-80"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header da coluna */}
      <div className={`rounded-t-lg border-2 ${column.color} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                isOverLimit ? 'bg-red-100 text-red-800' : ''
              }`}
            >
              {columnTasks.length}
              {column.limit && `/${column.limit}`}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onCreateTask(column.status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {column.limit && (
          <div className="text-xs text-muted-foreground">
            Limite: {column.limit} tarefas
          </div>
        )}
      </div>

      {/* Lista de tarefas */}
      <div className={`flex-1 border-l-2 border-r-2 border-b-2 ${column.color.replace('bg-', 'border-').replace('-50', '-200')} p-2 space-y-3 overflow-y-auto min-h-96`}>
        {columnTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm text-center">
              Nenhuma tarefa em<br />
              <strong>{column.title}</strong>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
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
    <div className="h-full">
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
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