import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Tag, 
  Link as LinkIcon, 
  Image, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  User,
  List,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { Task } from '@/hooks/useTasks';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskDialog } from './TaskDialog';
import { toast } from '@/hooks/use-toast';

interface TaskDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskDetailView({ open, onOpenChange, task }: TaskDetailViewProps) {
  const { 
    tasks: { deleteTask, updateTask, lists, getSubtasksByTaskId, updateSubtask, addSubtask }
  } = useData();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!task) return null;

  const list = lists.find(l => l.id === task.list_id);
  const subtasks = getSubtasksByTaskId(task.id);
  const completedSubtasks = subtasks.filter(s => s.completed).length;

  const handleDelete = async () => {
    if (!task) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onOpenChange(false);
      toast({
        title: "Tarefa excluída",
        description: `"${task.title}" foi removida com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!task) return;
    
    const newStatus = task.status === 'pendente' ? 'concluida' : 'pendente';
    const completed_at = newStatus === 'concluida' ? new Date().toISOString() : null;
    
    await updateTask(task.id, { 
      status: newStatus,
      completed_at 
    });
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;
    
    await updateSubtask(subtaskId, { completed: !subtask.completed });
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    await addSubtask(task.id, newSubtaskTitle.trim());
    
    setNewSubtaskTitle('');
  };

  const priorityColors = {
    baixa: 'bg-green-100 text-green-800 border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alta: 'bg-orange-100 text-orange-800 border-orange-200',
    urgente: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    pendente: 'bg-blue-100 text-blue-800 border-blue-200',
    concluida: 'bg-green-100 text-green-800 border-green-200',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'pendente';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                  <Badge className={statusColors[task.status]}>
                    {task.status === 'pendente' ? 'Pendente' : 'Concluída'}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive">Atrasada</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Lista
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {list?.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: list.color }}
                      />
                    )}
                    <span>{list?.name || 'Lista não encontrada'}</span>
                  </div>
                </CardContent>
              </Card>

              {task.due_date && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Vencimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className={isOverdue ? 'text-destructive font-medium' : ''}>
                        {format(new Date(task.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(task.due_date), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Descrição */}
            {task.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subtarefas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Subtarefas ({completedSubtasks}/{subtasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                      />
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  
                  {/* Adicionar nova subtarefa */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Nova subtarefa..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Link */}
            {task.link && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Link Relacionado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={task.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="truncate">{task.link}</span>
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Metadados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Criada em:</span>
                    <div>{format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Atualizada em:</span>
                    <div>{format(new Date(task.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                  </div>
                  {task.completed_at && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Concluída em:</span>
                      <div>{format(new Date(task.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Ações */}
            <div className="flex gap-3">
              <Button 
                onClick={handleToggleStatus}
                variant={task.status === 'pendente' ? 'default' : 'outline'}
                className="flex-1"
              >
                {task.status === 'pendente' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Concluída
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Marcar como Pendente
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <TaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
        mode="edit"
      />
    </>
  );
}