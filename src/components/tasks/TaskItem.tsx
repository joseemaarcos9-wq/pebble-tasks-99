import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/store/types';
import { format, isToday, isPast, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Calendar, 
  AlertCircle, 
  Link as LinkIcon,
  Edit,
  Trash2,
  Copy,
  Move,
  ExternalLink,
  Eye,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente individual de tarefa
 * Exibe informações da tarefa com ações contextuais
 */

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

export function TaskItem({ task, onEdit, onView }: TaskItemProps) {
  const { toggleTaskStatus, deleteTask, duplicateTask, moveTask, lists, preferences, toggleSubtask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Alterna o status da tarefa entre pendente/concluída
   */

  const handleToggleStatus = () => {
    toggleTaskStatus(task.id);
  };

  /**
   * Remove a tarefa com animação de feedback
   */

  const handleDelete = () => {
    setIsDeleting(true);
    // Pequeno delay para mostrar animação antes de deletar
    setTimeout(() => {
      deleteTask(task.id);
    }, 150);
  };

  /**
   * Duplica a tarefa atual
   */
  const handleDuplicate = () => {
    duplicateTask(task.id);
  };

  /**
   * Move a tarefa para uma lista diferente
   */
  const handleMoveToList = (listId: string) => {
    if (listId !== task.listId) {
      moveTask(task.id, listId);
    }
  };

  /**
   * Abre link externo se disponível
   */
  const handleOpenLink = () => {
    if (task.link) {
      window.open(task.link, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Retorna a cor baseada na prioridade da tarefa
   */

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-500';
      case 'alta':
        return 'bg-orange-500';
      case 'media':
        return 'bg-yellow-500';
      case 'baixa':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  /**
   * Retorna o label da prioridade em português
   */

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente';
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Média';
      case 'baixa':
        return 'Baixa';
      default:
        return 'Baixa';
    }
  };

  /**
   * Gera badge com informações de prazo
   * Inclui indicadores visuais para prazos críticos
   */

  const getDateBadge = () => {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    
    let label = format(dueDate, 'dd/MM', { locale: ptBR });
    let variant: 'default' | 'destructive' | 'outline' = 'outline';
    let className = '';

    if (isOverdue) {
      label = 'Atrasado';
      variant = 'destructive';
    } else if (isToday(dueDate)) {
      label = 'Hoje';
      className = 'border-accent text-accent';
    } else if (isTomorrow(dueDate)) {
      label = 'Amanhã';
    }

    return (
      <Badge variant={variant} className={cn('text-xs', className)}>
        <Calendar className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Dados computados para exibição
  const list = lists.find(l => l.id === task.listId);
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;
  const isCompactMode = preferences.density === 'compact';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDeleting ? 0 : 1, 
        y: isDeleting ? -10 : 0,
        scale: isDeleting ? 0.95 : 1
      }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group relative',
        'bg-card rounded-2xl border border-border shadow-subtle',
        isCompactMode ? 'p-3' : 'p-4',
        'hover:shadow-medium transition-all duration-150',
        task.status === 'concluida' && 'opacity-60'
      )}
    >
      <div className={cn('flex items-start space-x-3', isCompactMode && 'space-x-2')}>
        {/* Checkbox de status */}
        <Checkbox
          checked={task.status === 'concluida'}
          onCheckedChange={handleToggleStatus}
          className="mt-0.5"
        />
        
        {/* Conteúdo principal da tarefa */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Título da tarefa */}
              <h3 
                className={cn(
                  'font-medium leading-snug cursor-pointer hover:text-accent transition-colors',
                  isCompactMode ? 'text-sm' : 'text-sm',
                  task.status === 'concluida' && 'line-through text-muted-foreground'
                )}
                onClick={() => onEdit(task)}
              >
                {task.title}
              </h3>
              
              {/* Descrição (apenas se não estiver em modo compacto) */}
              {!isCompactMode && task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onView(task)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                
                {task.link && (
                  <DropdownMenuItem onClick={handleOpenLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Link
                  </DropdownMenuItem>
                )}
                
                {/* Submenu para mover entre listas */}
                {lists.length > 1 && (
                  <DropdownMenuItem asChild>
                    <div className="relative">
                      <Move className="h-4 w-4 mr-2" />
                      Mover para
                      <div className="absolute left-full top-0 ml-1 bg-popover border rounded-md shadow-md hidden group-hover:block">
                        {lists
                          .filter(l => l.id !== task.listId)
                          .map(targetList => (
                            <button
                              key={targetList.id}
                              onClick={() => handleMoveToList(targetList.id)}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-2 h-2 rounded-full mr-2" 
                                  style={{ backgroundColor: targetList.color || '#6b7280' }}
                                />
                                {targetList.name}
                              </div>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {/* Linha de metadados */}
          <div className={cn(
            'flex items-center justify-between',
            isCompactMode && 'text-xs'
          )}>
            <div className="flex items-center space-x-2">
              {/* Indicador de prioridade */}
              {/* Priority Indicator */}
              <div className="flex items-center space-x-1">
                <div className={cn('w-2 h-2 rounded-full', getPriorityColor(task.priority))} />
                <span className="text-xs text-muted-foreground">
                  {getPriorityLabel(task.priority)}
                </span>
              </div>

              {/* Lista atual */}

              {/* List */}
              {list && (
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: list.color || '#6b7280' }}
                  />
                  <span className="text-xs text-muted-foreground">{list.name}</span>
                </div>
              )}

              {/* Progresso das subtarefas */}
              {hasSubtasks && (
                <span className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} subtarefas
                </span>
              )}

              {/* Indicador de fotos */}
              {task.photos && task.photos.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Image className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{task.photos.length}</span>
                </div>
              )}

              {/* Indicador de link */}
              {task.link && (
                <LinkIcon className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-accent" 
                         onClick={handleOpenLink} />
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Tags (limitadas para não sobrecarregar) */}
              {/* Tags */}
              {task.tags.slice(0, isCompactMode ? 1 : 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                  #{tag}
                </Badge>
              ))}
              
              {task.tags.length > (isCompactMode ? 1 : 2) && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{task.tags.length - (isCompactMode ? 1 : 2)}
                </Badge>
              )}

              {/* Badge de prazo */}
              {getDateBadge()}
            </div>
          </div>

          {/* Fotos */}
          {task.photos && task.photos.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {task.photos.slice(0, 3).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-lg border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
              {task.photos.length > 3 && (
                <div className="h-16 w-16 bg-muted rounded-lg border flex items-center justify-center text-xs text-muted-foreground">
                  +{task.photos.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Subtarefas como checklist */}
          {hasSubtasks && !isCompactMode && (
            <div className="mt-3 space-y-1">
              {task.subtasks.slice(0, 3).map((subtask) => (
                <div key={subtask.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    className="h-3 w-3"
                  />
                  <span 
                    className={cn(
                      'text-xs',
                      subtask.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    )}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
              {task.subtasks.length > 3 && (
                <div className="text-xs text-muted-foreground pl-5">
                  +{task.subtasks.length - 3} mais subtarefas
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}