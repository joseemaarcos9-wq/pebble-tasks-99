import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { useState } from 'react';

interface SimpleTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function SimpleTransactionDialog({ isOpen, onClose }: SimpleTransactionDialogProps) {
  const { finance } = useData();
  const { addTransaction, accounts } = finance;
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');

  if (!isOpen) return null;

  const handleQuickAdd = async (description: string, value: number) => {
    const defaultAccount = accounts[0];
    if (!defaultAccount) return;

    await addTransaction({
      conta_id: defaultAccount.id,
      descricao: description,
      valor: tipo === 'despesa' ? -Math.abs(value) : Math.abs(value),
      tipo,
      data: new Date().toISOString().split('T')[0],
      status: 'compensada',
      tags: '',
      categoria_id: null,
      anexo_url: null,
      meta: null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={tipo === 'receita' ? 'default' : 'outline'}
              onClick={() => setTipo('receita')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita
            </Button>
            <Button
              variant={tipo === 'despesa' ? 'default' : 'outline'}
              onClick={() => setTipo('despesa')}
              className="flex-1"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Despesa
            </Button>
          </div>
          
          <input
            type="text"
            placeholder="Descrição da transação..."
            className="w-full p-3 border rounded-lg"
            id="description-input"
          />
          
          <input
            type="number"
            placeholder="Valor (R$)"
            className="w-full p-3 border rounded-lg"
            step="0.01"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const descInput = document.getElementById('description-input') as HTMLInputElement;
                const description = descInput?.value.trim();
                const value = parseFloat(e.currentTarget.value);
                
                if (description && value > 0) {
                  handleQuickAdd(description, value);
                }
              }
            }}
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

export function QuickActions() {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  return (
    <>
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setShowTaskDialog(true)}
          className="flex-1 h-12"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        
        <Button
          onClick={() => setShowTransactionDialog(true)}
          className="flex-1 h-12"
          variant="outline"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      <SimpleTransactionDialog
        isOpen={showTransactionDialog}
        onClose={() => setShowTransactionDialog(false)}
      />
      
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        mode="create"
      />
    </>
  );
}