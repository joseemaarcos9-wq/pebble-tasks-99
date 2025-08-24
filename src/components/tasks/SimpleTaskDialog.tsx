import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Plus, Calendar, Tag } from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';

interface SimpleTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleTaskDialog({ isOpen, onClose }: SimpleTaskDialogProps) {
  const { tasks } = useData();
  const { addTask, lists } = tasks;

  if (!isOpen) return null;

  const handleQuickAdd = async (title: string) => {
    const defaultList = lists[0];
    if (!defaultList) return;

    await addTask({
      title,
      list_id: defaultList.id,
      status: 'pendente',
      priority: 'media',
      description: null,
      tags: [],
      due_date: null,
      completed_at: null,
      link: null,
      photos: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Nova Tarefa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Digite o título da tarefa..."
            className="w-full p-3 border rounded-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleQuickAdd(e.currentTarget.value.trim());
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}