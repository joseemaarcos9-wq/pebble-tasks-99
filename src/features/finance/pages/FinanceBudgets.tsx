import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/components/providers/DataProvider';
import { BudgetDialog } from '@/components/finance/BudgetDialog';
import { Budget } from '@/features/finance/types';
import { formatCurrency } from '../utils/formatters';
import { Plus, MoreHorizontal, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FinanceBudgets() {
  const { finance: { budgets, categories, transactions, loading } } = useData();
  const { toast } = useToast();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setDialogMode('create');
    setIsBudgetDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setDialogMode('edit');
    setIsBudgetDialogOpen(true);
  };

  const handleDeleteBudget = async (budget: any) => {
    const categoryName = getCategoryName(budget.categoria_id);
    if (confirm(`Tem certeza que deseja excluir o orçamento para "${categoryName}"?`)) {
      toast({
        title: "Funcionalidade não implementada",
        description: "A exclusão de orçamentos será implementada em breve.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsBudgetDialogOpen(false);
    setSelectedBudget(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nome || 'Categoria não encontrada';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.cor || '#6B7280';
  };

  const getBudgetSpent = (budget: any) => {
    const [year, month] = budget.mes_ano.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.data);
        return (
          transaction.categoria_id === budget.categoria_id &&
          transaction.tipo === 'despesa' &&
          transaction.status === 'compensada' &&
          transactionDate >= startDate &&
          transactionDate <= endDate
        );
      })
      .reduce((total, transaction) => total + transaction.valor, 0);
  };

  const getBudgetStatus = (budget: any, spent: number) => {
    const percentage = (spent / budget.valor_planejado) * 100;
    
    if (percentage >= 100) return 'exceeded';
    if (percentage >= budget.alert_threshold_pct) return 'warning';
    return 'ok';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'exceeded': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge className="bg-green-100 text-green-800">No prazo</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'exceeded': return <Badge className="bg-red-100 text-red-800">Excedido</Badge>;
      default: return null;
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthBudgets = budgets.filter(budget => budget.mes_ano === currentMonth);
  const totalBudgeted = currentMonthBudgets.reduce((total, budget) => total + budget.valor_planejado, 0);
  const totalSpent = currentMonthBudgets.reduce((total, budget) => total + getBudgetSpent(budget), 0);
  const budgetsExceeded = currentMonthBudgets.filter(budget => {
    const spent = getBudgetSpent(budget);
    return getBudgetStatus(budget, spent) === 'exceeded';
  }).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Orçamentos</h1>
          <p className="text-muted-foreground">Controle seus gastos por categoria</p>
        </div>
        <Button onClick={handleCreateBudget}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Resumo do mês atual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(totalBudgeted)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthBudgets.length} orçamento{currentMonthBudgets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudgeted > 0 ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}%` : '0%'} do orçamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.max(0, totalBudgeted - totalSpent))}
            </div>
            <p className="text-xs text-muted-foreground">
              Restante este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {budgetsExceeded}
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos ultrapassados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Orçamentos por Categoria</h2>
        
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum orçamento encontrado</p>
              <Button onClick={handleCreateBudget}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => {
              const spent = getBudgetSpent(budget);
              const status = getBudgetStatus(budget, spent);
              const percentage = Math.min((spent / budget.valor_planejado) * 100, 100);
              const remaining = budget.valor_planejado - spent;
              
              return (
                <Card key={budget.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(budget.categoria_id) }}
                        />
                        <div>
                          <h3 className="font-medium">{getCategoryName(budget.categoria_id)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {budget.mes_ano} • Alerta em {budget.alert_threshold_pct}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBudget(budget as any)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBudget(budget)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gasto: {formatCurrency(spent)}</span>
                        <span>Orçamento: {formatCurrency(budget.valor_planejado)}</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${
                          status === 'exceeded' ? '[&>div]:bg-red-500' :
                          status === 'warning' ? '[&>div]:bg-yellow-500' :
                          '[&>div]:bg-green-500'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% usado</span>
                        <span>
                          {remaining >= 0 ? 
                            `${formatCurrency(remaining)} restante` : 
                            `${formatCurrency(Math.abs(remaining))} excedido`
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BudgetDialog 
        open={isBudgetDialogOpen}
        onOpenChange={handleDialogClose}
        budget={selectedBudget}
        mode={dialogMode}
      />
    </div>
  );
}