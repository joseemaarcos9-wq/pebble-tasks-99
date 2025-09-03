import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/components/providers/DataProvider';
import { TaskFilters } from '@/hooks/useTasks';
import { 
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
  X
} from 'lucide-react';

const iconOptions = [
  { value: 'Calendar', label: 'Calendário', icon: Calendar },
  { value: 'CheckSquare', label: 'Quadrado', icon: CheckSquare },
  { value: 'Clock', label: 'Relógio', icon: Clock },
  { value: 'Star', label: 'Estrela', icon: Star },
  { value: 'Target', label: 'Alvo', icon: Target },
  { value: 'Zap', label: 'Raio', icon: Zap },
  { value: 'BookOpen', label: 'Livro', icon: BookOpen },
  { value: 'Coffee', label: 'Café', icon: Coffee },
  { value: 'Home', label: 'Casa', icon: Home },
  { value: 'Briefcase', label: 'Maleta', icon: Briefcase },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Users', label: 'Usuários', icon: Users },
];

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
];

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.string().min(1, 'Selecione uma cor'),
  status: z.enum(['all', 'pending', 'completed']).optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  listId: z.string().optional(),
  dateRange: z.enum(['today', 'week', 'overdue']).optional(),
  tags: z.array(z.string()).default([]),
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CustomViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingViewId?: string | null;
}

export function CustomViewDialog({ isOpen, onClose, editingViewId }: CustomViewDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { 
    tasks: { 
      customViews, 
      lists, 
      getAllTags,
      addCustomView, 
      updateCustomView 
    } 
  } = useData();

  const editingView = editingViewId ? customViews.find(v => v.id === editingViewId) : null;
  const allTags = getAllTags();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: 'Target',
      color: '#3b82f6',
      status: 'all',
      priority: undefined,
      listId: undefined,
      dateRange: undefined,
      tags: [],
      search: '',
    },
  });

  useEffect(() => {
    if (editingView) {
      form.reset({
        name: editingView.name,
        icon: editingView.icon,
        color: editingView.color,
        status: editingView.filters.status || 'all',
        priority: editingView.filters.priority,
        listId: editingView.filters.listId,
        dateRange: editingView.filters.dateRange,
        tags: editingView.filters.tags || [],
        search: editingView.filters.search || '',
      });
      setSelectedTags(editingView.filters.tags || []);
    } else {
      form.reset({
        name: '',
        icon: 'Target',
        color: '#3b82f6',
        status: 'all',
        priority: undefined,
        listId: undefined,
        dateRange: undefined,
        tags: [],
        search: '',
      });
      setSelectedTags([]);
    }
  }, [editingView, form, isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      const filters: TaskFilters = {
        status: data.status || 'all',
        priority: data.priority,
        listId: data.listId,
        dateRange: data.dateRange,
        tags: selectedTags,
        search: data.search || '',
      };

      const viewData = {
        name: data.name,
        icon: data.icon,
        color: data.color,
        filters,
      };

      if (editingViewId) {
        await updateCustomView(editingViewId, viewData);
      } else {
        await addCustomView(viewData.name, viewData.icon, viewData.filters, viewData.color);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving custom view:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedTags([]);
    onClose();
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingViewId ? 'Editar Visualização' : 'Nova Visualização'}
          </DialogTitle>
          <DialogDescription>
            Configure os filtros e personalize sua visualização personalizada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Visualização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tarefas Urgentes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color ? 'border-foreground scale-110' : 'border-muted-foreground/20'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Filters */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Filtros</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="pending">Pendentes</SelectItem>
                          <SelectItem value="completed">Concluídas</SelectItem>
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Qualquer prioridade</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lista</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer lista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Qualquer lista</SelectItem>
                          {lists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: list.color || '#6b7280' }}
                                />
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
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Qualquer período</SelectItem>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="week">Esta Semana</SelectItem>
                          <SelectItem value="overdue">Atrasadas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Etiquetas</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter(tag => !selectedTags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="text-sm px-2 py-1 border border-muted-foreground/20 rounded-md hover:bg-accent transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>

              {/* Search */}
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buscar por texto</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite palavras-chave..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingViewId ? 'Atualizar' : 'Criar'} Visualização
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}