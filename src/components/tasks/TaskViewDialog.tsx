import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Link as LinkIcon,
  ExternalLink,
  Edit,
  Clock,
  Tag,
  List,
  CheckSquare,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { Task } from '@/store/types';
import { useTaskStore } from '@/store/useTaskStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TaskViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  task: Task | undefined;
}

export function TaskViewDialog({ isOpen, onClose, onEdit, task }: TaskViewDialogProps) {
  const { lists, updateTask } = useTaskStore();
  const [localSubtasks, setLocalSubtasks] = useState(task?.subtasks || []);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Sync local subtasks with task changes
  useEffect(() => {
    if (task) {
      setLocalSubtasks(task.subtasks);
      setHasChanges(false);
    }
  }, [task]);
  
  if (!task) return null;

  const list = lists.find(l => l.id === task.listId);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-500 text-white';
      case 'alta':
        return 'bg-orange-500 text-white';
      case 'media':
        return 'bg-yellow-500 text-black';
      case 'baixa':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

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

  const handleOpenLink = () => {
    if (task.link) {
      window.open(task.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setLocalSubtasks(prev => 
      prev.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    if (hasChanges) {
      updateTask(task.id, { subtasks: localSubtasks });
      setHasChanges(false);
    }
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Reset local subtasks to original state
      setLocalSubtasks(task.subtasks);
      setHasChanges(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-semibold leading-relaxed pr-8">
              {task.title}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
          
          {/* Priority and List */}
          <div className="flex items-center gap-3">
            <Badge className={cn('px-3 py-1', getPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </Badge>
            
            {list && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <List className="h-4 w-4" />
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: list.color || '#6b7280' }}
                  />
                  {list.name}
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Due Date and Time */}
          {task.dueDate && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Prazo</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          )}

          {/* Link */}
          {task.link && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Link</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenLink}
                className="w-fit"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Abrir Link
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {task.photos && task.photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <h3 className="text-sm font-medium text-foreground">
                  Fotos ({task.photos.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {task.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1} da tarefa`}
                      className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(photo, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {localSubtasks && localSubtasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <h3 className="text-sm font-medium text-foreground">
                  Subtarefas ({localSubtasks.filter(st => st.completed).length}/{localSubtasks.length})
                </h3>
              </div>
              <div className="space-y-2 pl-6">
                {localSubtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                    />
                    <span className={cn(
                      'text-sm',
                      subtask.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creation Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Criada em {format(new Date(task.createdAt), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}