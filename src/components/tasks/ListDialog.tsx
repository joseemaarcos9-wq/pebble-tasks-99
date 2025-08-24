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
import { useData } from '@/components/providers/DataProvider';
import { toast } from '@/hooks/use-toast';

interface ListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingListId?: string | null;
}

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

export function ListDialog({ isOpen, onClose, editingListId }: ListDialogProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const { tasks } = useData();
  const { addList, updateList, lists } = tasks;
  
  // Get editing list data
  const editingList = editingListId ? lists.find(list => list.id === editingListId) : null;
  const isEditing = !!editingListId;

  // Initialize form with editing data
  useEffect(() => {
    if (isEditing && editingList) {
      setName(editingList.name);
      setSelectedColor(editingList.color || colorOptions[0].value);
    } else {
      setName('');
      setSelectedColor(colorOptions[0].value);
    }
  }, [isEditing, editingList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para a lista.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editingListId) {
      updateList(editingListId, { name: name.trim(), color: selectedColor });
      toast({
        title: "Lista atualizada!",
        description: `A lista "${name}" foi atualizada com sucesso.`,
      });
    } else {
      addList(name.trim(), selectedColor);
      toast({
        title: "Lista criada!",
        description: `A lista "${name}" foi criada com sucesso.`,
      });
    }
    
    // Reset form and close
    setName('');
    setSelectedColor(colorOptions[0].value);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedColor(colorOptions[0].value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lista' : 'Nova Lista'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">Nome da Lista</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da lista..."
              autoFocus
            />
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar Alterações' : 'Criar Lista'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}