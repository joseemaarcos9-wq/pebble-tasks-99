import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Tag, 
  Link, 
  Image, 
  Plus, 
  X, 
  CheckCircle, 
  Circle,
  Trash2
} from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { Task, Subtask } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  list_id: z.string().min(1, 'Lista é obrigatória'),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
  status: z.enum(['pendente', 'concluida']),
  kanban_status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']),
  due_date: z.string().optional(),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  mode?: 'create' | 'edit';
}

export function TaskDialog({ open, onOpenChange, task, mode = 'create' }: TaskDialogProps) {
  const { tasks: { addTask, updateTask, lists, addSubtask, updateSubtask, deleteSubtask, getSubtasksByTaskId } } = useData();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      list_id: '',
      priority: 'media',
      status: 'pendente',
      kanban_status: 'backlog',
      due_date: '',
      link: '',
      tags: '',
    },
  });

  // Load task data when editing
  useEffect(() => {
    if (open) {
      if (task && mode === 'edit') {
        // Reset form with task data for edit mode
        const formData = {
          title: task.title,
          description: task.description || '',
          list_id: task.list_id,
          priority: task.priority,
          status: task.status,
          kanban_status: task.kanban_status || 'backlog',
          due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
          link: task.link || '',
          tags: task.tags.join(', '),
        };
        
        form.reset(formData);
        setSelectedTags([...task.tags]);
        setPhotos([...(task.photos || [])]);
        
        // Load subtasks
        const taskSubtasks = getSubtasksByTaskId(task.id);
        setSubtasks([...taskSubtasks]);
      } else {
        // Reset form for create mode
        const defaultFormData = {
          title: '',
          description: '',
          list_id: lists[0]?.id || '',
          priority: 'media' as const,
          status: 'pendente' as const,
          kanban_status: 'backlog' as const,
          due_date: '',
          link: '',
          tags: '',
        };
        
        form.reset(defaultFormData);
        setSelectedTags([]);
        setPhotos([]);
        setSubtasks([]);
      }
      setNewSubtaskTitle('');
    }
  }, [open, task, mode, form, lists, getSubtasksByTaskId]);

  const onSubmit = async (data: TaskFormData) => {
    const taskData = {
      ...data,
      tags: selectedTags,
      photos,
      due_date: data.due_date || null,
      link: data.link || null,
      description: data.description || null,
      completed_at: data.status === 'concluida' ? new Date().toISOString() : null,
    };

    try {
      if (mode === 'edit' && task) {
        const result = await updateTask(task.id, taskData);
        
        if (result?.error) {
          throw new Error(result.error.message || 'Erro ao atualizar tarefa');
        }
        
        // Add new subtasks (those with temporary IDs) in edit mode
        for (const subtask of subtasks) {
          if (subtask.id.startsWith('temp-')) {
            await addSubtask({
              task_id: task.id,
              title: subtask.title,
              completed: subtask.completed,
            });
          }
        }
        
        toast({
          title: "Tarefa atualizada!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const result = await addTask(taskData);
        if (result?.error) {
          throw new Error(result.error.message || 'Erro ao criar tarefa');
        }
        
        if (result?.data) {
          // Add subtasks after creating the task
          for (const subtask of subtasks) {
            await addSubtask({
              task_id: result.data.id,
              title: subtask.title,
              completed: subtask.completed,
            });
          }
        }
        
        toast({
          title: "Tarefa criada!",
          description: "A tarefa foi criada com sucesso.",
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedTags([]);
    setPhotos([]);
    setSubtasks([]);
    setNewSubtaskTitle('');
    onOpenChange(false);
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      form.setValue('tags', '');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const addNewSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: `temp-${Date.now()}`,
        task_id: task?.id || '',
        title: newSubtaskTitle.trim(),
        completed: false,
        created_at: new Date().toISOString(),
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const updatedSubtask = { ...subtask, completed: !subtask.completed };
    
    if (mode === 'edit' && task && !subtaskId.startsWith('temp-')) {
      await updateSubtask(subtaskId, { completed: updatedSubtask.completed });
    }
    
    setSubtasks(subtasks.map(s => s.id === subtaskId ? updatedSubtask : s));
  };

  const removeSubtask = async (subtaskId: string) => {
    if (mode === 'edit' && task && !subtaskId.startsWith('temp-')) {
      await deleteSubtask(subtaskId);
    }
    setSubtasks(subtasks.filter(s => s.id !== subtaskId));
  };

  const addPhoto = (url: string) => {
    if (url && !photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter(p => p !== url));
  };

  const priorityColors = {
    baixa: 'bg-green-100 text-green-800 border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alta: 'bg-orange-100 text-orange-800 border-orange-200',
    urgente: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifique os detalhes da sua tarefa.' 
              : 'Crie uma nova tarefa com todos os detalhes necessários.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título da tarefa..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os detalhes da tarefa..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="list_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lista *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma lista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              <div className="flex items-center gap-2">
                                {list.color && (
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: list.color }}
                                  />
                                )}
                                {list.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baixa">
                            <Badge className={priorityColors.baixa}>Baixa</Badge>
                          </SelectItem>
                          <SelectItem value="media">
                            <Badge className={priorityColors.media}>Média</Badge>
                          </SelectItem>
                          <SelectItem value="alta">
                            <Badge className={priorityColors.alta}>Alta</Badge>
                          </SelectItem>
                          <SelectItem value="urgente">
                            <Badge className={priorityColors.urgente}>Urgente</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="date" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kanban_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coluna do Kanban</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag..."
                  value={form.watch('tags') || ''}
                  onChange={(e) => form.setValue('tags', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value.trim());
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addTag(form.getValues('tags') || '')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Subtarefas */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Subtarefas ({subtasks.length})
              </Label>
              
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Nova subtarefa..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNewSubtask();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addNewSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Link */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Link Relacionado
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {mode === 'edit' ? 'Salvar Alterações' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}