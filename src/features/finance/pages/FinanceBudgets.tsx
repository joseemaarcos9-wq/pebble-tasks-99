import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../store';
import { formatCurrency } from '../utils/formatters';
import { useInitializeFinanceData } from '../hooks/useInitializeFinanceData';
import { toast } from '@/hooks/use-toast';

export function FinanceBudgets() {
  useInitializeFinanceData();
  const { 
    budgets, 
    categories, 
    getBudgetStatus, 
    createBudget, 
    updateBudget, 
    deleteBudget 
  } = useFinanceStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoriaId: '',
    valorPlanejado: '',
    mesAno: new Date().toISOString().slice(0, 7), // YYYY-MM
    alertThresholdPct: '80'
  });

  const expenseCategories = categories.filter(c => c.tipo === 'despesa');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudgets = budgets.filter(b => b.mesAno === currentMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoriaId || !formData.valorPlanejado) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const budgetData = {
      categoriaId: formData.categoriaId,
      valorPlanejado: parseFloat(formData.valorPlanejado),
      mesAno: formData.mesAno,
      alertThresholdPct: parseInt(formData.alertThresholdPct)
    };

    if (editingBudget) {
      updateBudget(editingBudget, budgetData);
    } else {
      createBudget(budgetData);
    }

    setIsDialogOpen(false);
    setEditingBudget(null);
    setFormData({
      categoriaId: '',
      valorPlanejado: '',
      mesAno: currentMonth,
      alertThresholdPct: '80'
    });
  };

  const handleEdit = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setFormData({
        categoriaId: budget.categoriaId,
        valorPlanejado: budget.valorPlanejado.toString(),
        mesAno: budget.mesAno,
        alertThresholdPct: budget.alertThresholdPct.toString()
      });
      setEditingBudget(budgetId);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (budgetId: string) => {
    deleteBudget(budgetId);
  };

  const getTotalBudgeted = () => {
    return currentBudgets.reduce((total, budget) => total + budget.valorPlanejado, 0);
  };

  const getTotalSpent = () => {
    return currentBudgets.reduce((total, budget) => {
      const status = getBudgetStatus(budget.id);
      return total + status.valorGasto;
    }, 0);
  };

  const getOverallProgress = () => {
    const totalBudgeted = getTotalBudgeted();
    const totalSpent = getTotalSpent();
    return totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Controle seus gastos e mantenha-se dentro do orçamento
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </DialogTitle>
              <DialogDescription>
                Configure um orçamento para controlar seus gastos por categoria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoriaId} 
                  onValueChange={(value) => setFormData({...formData, categoriaId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor Planejado</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valorPlanejado}
                  onChange={(e) => setFormData({...formData, valorPlanejado: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mes">Mês/Ano</Label>
                <Input
                  id="mes"
                  type="month"
                  value={formData.mesAno}
                  onChange={(e) => setFormData({...formData, mesAno: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert">Alerta quando atingir (%):</Label>
                <Input
                  id="alert"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alertThresholdPct}
                  onChange={(e) => setFormData({...formData, alertThresholdPct: e.target.value})}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Atualizar' : 'Criar'} Orçamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(getTotalBudgeted())}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentBudgets.length} orçamento{currentBudgets.length !== 1 ? 's' : ''} ativo{currentBudgets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getTotalSpent())}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(getOverallProgress())}% do orçamento total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(getTotalBudgeted() - getTotalSpent())}
            </div>
            <p className="text-xs text-muted-foreground">
              Restante do orçamento total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {currentBudgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum orçamento criado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie seu primeiro orçamento para começar a controlar seus gastos
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          currentBudgets.map(budget => {
            const status = getBudgetStatus(budget.id);
            const isOverBudget = status.percentage > 100;
            const isNearLimit = status.percentage >= budget.alertThresholdPct;
            
            return (
              <Card key={budget.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{status.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(status.valorGasto)} de {formatCurrency(status.valorPlanejado)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Excedido
                        </Badge>
                      )}
                      {isNearLimit && !isOverBudget && (
                        <Badge variant="secondary" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Atenção
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(budget.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{Math.round(status.percentage)}%</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(status.valorPlanejado - status.valorGasto)} restante
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(status.percentage, 100)} 
                      className="h-2"
                    />
                    {isOverBudget && (
                      <p className="text-xs text-destructive">
                        Excedido em {formatCurrency(status.valorGasto - status.valorPlanejado)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}