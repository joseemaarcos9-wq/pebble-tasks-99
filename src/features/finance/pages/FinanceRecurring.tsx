import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/components/providers/DataProvider';
import { RecurrenceDialog } from '@/components/finance/RecurrenceDialog';
import { Recurrence } from '@/features/finance/types';
import { formatCurrency } from '../utils/formatters';
import { Plus, MoreHorizontal, Edit, Trash2, Play, Pause, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinanceRecurring() {
  const { finance: { recurrences, accounts, categories, deleteRecurrence, updateRecurrence, loading } } = useData();
  const { toast } = useToast();
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState<Recurrence | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const handleCreateRecurrence = () => {
    setSelectedRecurrence(null);
    setDialogMode('create');
    setIsRecurrenceDialogOpen(true);
  };

  const handleEditRecurrence = (recurrence: Recurrence) => {
    setSelectedRecurrence(recurrence);
    setDialogMode('edit');
    setIsRecurrenceDialogOpen(true);
  };

  const handleDeleteRecurrence = async (recurrence: Recurrence) => {
    if (confirm(`Tem certeza que deseja excluir a recorrência "${recurrence.descricao || 'Sem descrição'}"?`)) {
      try {
        await deleteRecurrence(recurrence.id);
        toast({
          title: "Recorrência excluída",
          description: "A recorrência foi excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir recorrência",
          description: "Não foi possível excluir a recorrência. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (recurrence: Recurrence) => {
    try {
      await updateRecurrence(recurrence.id, {
        ...recurrence,
        ativo: !recurrence.ativo
      });
      toast({
        title: recurrence.ativo ? "Recorrência pausada" : "Recorrência ativada",
        description: `A recorrência foi ${recurrence.ativo ? 'pausada' : 'ativada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da recorrência.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsRecurrenceDialogOpen(false);
    setSelectedRecurrence(null);
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.nome || 'Conta não encontrada';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nome || 'Categoria não encontrada';
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.cor || '#6B7280';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      'mensal': 'Mensal',
      'semanal': 'Semanal',
      'anual': 'Anual',
      'custom': 'Personalizado'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getNextOccurrence = (recurrence: Recurrence) => {
    const nextDate = parseISO(recurrence.proximaOcorrencia);
    return format(nextDate, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getDaysUntilNext = (recurrence: Recurrence) => {
    const nextDate = parseISO(recurrence.proximaOcorrencia);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeRecurrences = recurrences.filter(r => r.ativo);
  const inactiveRecurrences = recurrences.filter(r => !r.ativo);
  const totalMonthlyIncome = activeRecurrences
    .filter(r => r.tipo === 'receita')
    .reduce((total, r) => total + r.valor, 0);
  const totalMonthlyExpenses = activeRecurrences
    .filter(r => r.tipo === 'despesa')
    .reduce((total, r) => total + r.valor, 0);
  const upcomingRecurrences = activeRecurrences
    .filter(r => getDaysUntilNext(r) <= 7)
    .sort((a, b) => getDaysUntilNext(a) - getDaysUntilNext(b));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando recorrências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transações Recorrentes</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas automáticas</p>
        </div>
        <Button onClick={handleCreateRecurrence}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recorrência
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Mensais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRecurrences.filter(r => r.tipo === 'receita').length} recorrência{activeRecurrences.filter(r => r.tipo === 'receita').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRecurrences.filter(r => r.tipo === 'despesa').length} recorrência{activeRecurrences.filter(r => r.tipo === 'despesa').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalMonthlyIncome - totalMonthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferença mensal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 7 dias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingRecurrences.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Transações pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Recorrências */}
      {upcomingRecurrences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Próximas Transações (7 dias)</h2>
          <div className="grid gap-3">
            {upcomingRecurrences.map((recurrence) => {
              const daysUntil = getDaysUntilNext(recurrence);
              const Icon = recurrence.tipo === 'receita' ? TrendingUp : TrendingDown;
              
              return (
                <Card key={`upcoming-${recurrence.id}`} className="border-l-4" style={{ borderLeftColor: getCategoryColor(recurrence.categoriaId) }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${
                          recurrence.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">
                            {recurrence.descricao || getCategoryName(recurrence.categoriaId)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getAccountName(recurrence.contaId)} • {getNextOccurrence(recurrence)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          recurrence.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {recurrence.tipo === 'receita' ? '+' : '-'}{formatCurrency(recurrence.valor)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {daysUntil === 0 ? 'Hoje' : 
                           daysUntil === 1 ? 'Amanhã' : 
                           `Em ${daysUntil} dias`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Recorrências */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as Recorrências</h2>
        
        {recurrences.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma recorrência encontrada</p>
              <Button onClick={handleCreateRecurrence}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira recorrência
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recurrences.map((recurrence) => {
              const Icon = recurrence.tipo === 'receita' ? TrendingUp : TrendingDown;
              const daysUntil = getDaysUntilNext(recurrence);
              
              return (
                <Card key={recurrence.id} className={`${!recurrence.ativo ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(recurrence.categoriaId) }}
                        />
                        <Icon className={`h-5 w-5 ${
                          recurrence.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">
                            {recurrence.descricao || getCategoryName(recurrence.categoriaId)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getAccountName(recurrence.contaId)} • {getFrequencyLabel(recurrence.frequencia)} • 
                            Próxima: {getNextOccurrence(recurrence)}
                          </p>
                          {recurrence.tags && (
                            <div className="flex gap-1 mt-1">
                              {recurrence.tags.split(',').map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xl font-semibold ${
                            recurrence.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {recurrence.tipo === 'receita' ? '+' : '-'}{formatCurrency(recurrence.valor)}
                          </div>
                          {recurrence.ativo && (
                            <p className="text-xs text-muted-foreground">
                              {daysUntil <= 0 ? 'Vencida' : 
                               daysUntil === 1 ? 'Amanhã' : 
                               `${daysUntil} dias`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={recurrence.ativo}
                            onCheckedChange={() => handleToggleActive(recurrence)}
                          />
                          <Badge variant={recurrence.ativo ? 'default' : 'secondary'}>
                            {recurrence.ativo ? 'Ativo' : 'Pausado'}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRecurrence(recurrence)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(recurrence)}>
                                {recurrence.ativo ? (
                                  <><Pause className="h-4 w-4 mr-2" />Pausar</>
                                ) : (
                                  <><Play className="h-4 w-4 mr-2" />Ativar</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRecurrence(recurrence)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RecurrenceDialog 
        open={isRecurrenceDialogOpen}
        onOpenChange={handleDialogClose}
        recurrence={selectedRecurrence}
        mode={dialogMode}
      />
    </div>
  );
}