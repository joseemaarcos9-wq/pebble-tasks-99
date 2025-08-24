import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/useTaskStore';
import { toast } from '@/hooks/use-toast';
import { TaskFilters, Priority } from '@/store/types';
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
  Users
} from 'lucide-react';

interface CustomViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingViewId?: string | null;
}

const iconOptions = [
  { name: 'Calendário', value: 'Calendar', icon: Calendar },
  { name: 'Tarefa', value: 'CheckSquare', icon: CheckSquare },
  { name: 'Relógio', value: 'Clock', icon: Clock },
  { name: 'Estrela', value: 'Star', icon: Star },
  { name: 'Alvo', value: 'Target', icon: Target },
  { name: 'Raio', value: 'Zap', icon: Zap },
  { name: 'Livro', value: 'BookOpen', icon: BookOpen },
  { name: 'Café', value: 'Coffee', icon: Coffee },
  { name: 'Casa', value: 'Home', icon: Home },
  { name: 'Trabalho', value: 'Briefcase', icon: Briefcase },
  { name: 'Coração', value: 'Heart', icon: Heart },
  { name: 'Pessoas', value: 'Users', icon: Users },
];

const colorOptions = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

export function CustomViewDialog({ isOpen, onClose, editingViewId }: CustomViewDialogProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0].value);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    tags: [],
    search: '',
  });

  const { addCustomView, updateCustomView, customViews, lists } = useTaskStore();
  
  // Get editing view data
  const editingView = editingViewId ? customViews.find(view => view.id === editingViewId) : null;
  const isEditing = !!editingViewId;

  // Initialize form with editing data
  useEffect(() => {
    if (isEditing && editingView) {
      setName(editingView.name);
      setSelectedIcon(editingView.icon);
      setSelectedColor(editingView.color || colorOptions[0].value);
      setFilters(editingView.filters);
    } else {
      setName('');
      setSelectedIcon(iconOptions[0].value);
      setSelectedColor(colorOptions[0].value);
      setFilters({
        status: 'all',
        tags: [],
        search: '',
      });
    }
  }, [isEditing, editingView]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para a visualização.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editingViewId) {
      updateCustomView(editingViewId, { 
        name: name.trim(), 
        icon: selectedIcon, 
        color: selectedColor,
        filters 
      });
    } else {
      addCustomView(name.trim(), selectedIcon, filters, selectedColor);
    }
    
    // Reset form and close
    setName('');
    setSelectedIcon(iconOptions[0].value);
    setSelectedColor(colorOptions[0].value);
    setFilters({
      status: 'all',
      tags: [],
      search: '',
    });
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(iconOptions[0].value);
    setSelectedColor(colorOptions[0].value);
    setFilters({
      status: 'all',
      tags: [],
      search: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Visualização' : 'Nova Visualização'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="view-name">Nome da Visualização</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Checklist Semanal, Tarefas Urgentes..."
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((iconOpt) => {
                const IconComponent = iconOpt.icon;
                return (
                  <button
                    key={iconOpt.value}
                    type="button"
                    onClick={() => setSelectedIcon(iconOpt.value)}
                    className={`
                      relative flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors
                      ${selectedIcon === iconOpt.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-muted-foreground'
                      }
                    `}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">
                      {iconOpt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    relative flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors
                    ${selectedColor === color.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-muted-foreground'
                    }
                  `}
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-4 border-t pt-4">
            <Label>Filtros da Visualização</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: 'all' | 'pending' | 'completed') => 
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Lista</Label>
                <Select
                  value={filters.listId || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, listId: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as listas</SelectItem>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Prioridade</Label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, priority: value === 'all' ? undefined : value as Priority })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Prazo</Label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, dateRange: value === 'all' ? undefined : value as any })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar Alterações' : 'Criar Visualização'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}