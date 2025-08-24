import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Calendar, 
  Repeat, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useInitializeFinanceData } from '../hooks/useInitializeFinanceData';
import { toast } from '@/hooks/use-toast';
import { format, addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinanceRecurring() {
  useInitializeFinanceData();
  const { 
    recurrences, 
    accounts, 
    categories,
    createRecurrence, 
    updateRecurrence, 
    deleteRecurrence,
    generateRecurrenceTransactions
  } = useFinanceStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'despesa' as 'despesa' | 'receita',
    frequencia: 'mensal' as 'mensal' | 'semanal' | 'anual',
    diaBase: '1',
    proximaOcorrencia: format(new Date(), 'yyyy-MM-dd'),
    contaId: '',
    valor: '',
    categoriaId: '',
    descricao: '',
    tags: '',
    ativo: true
  });

  const activeRecurrences = recurrences.filter(r => r.ativo);
  const inactiveRecurrences = recurrences.filter(r => !r.ativo);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.nome || 'Conta desconhecida';
  };

  const getCategoryName = (categoryId?: string) => {
    return categoryId ? categories.find(c => c.id === categoryId)?.nome : 'Sem categoria';
  };

  const getFrequencyText = (frequency: string) => {
    const frequencyMap = {
      mensal: 'Mensal',
      semanal: 'Semanal',
      anual: 'Anual'
    };
    return frequencyMap[frequency as keyof typeof frequencyMap] || frequency;
  };

  const getNextOccurrences = (recurrence: any, count: number = 3) => {
    const dates = [];
    let currentDate = new Date(recurrence.proximaOcorrencia);
    
    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate));
      
      switch (recurrence.frequencia) {
        case 'mensal':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'semanal':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'anual':
          currentDate = addYears(currentDate, 1);
          break;
      }
    }
    
    return dates;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contaId || !formData.valor || !formData.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const recurrenceData = {
      tipo: formData.tipo,
      frequencia: formData.frequencia,
      diaBase: parseInt(formData.diaBase),
      proximaOcorrencia: formData.proximaOcorrencia,
      contaId: formData.contaId,
      valor: parseFloat(formData.valor) * (formData.tipo === 'despesa' ? -1 : 1),
      categoriaId: formData.categoriaId || undefined,
      descricao: formData.descricao,
      tags: formData.tags,
      ativo: formData.ativo
    };

    if (editingRecurrence) {
      updateRecurrence(editingRecurrence, recurrenceData);
    } else {
      createRecurrence(recurrenceData);
    }

    setIsDialogOpen(false);
    setEditingRecurrence(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tipo: 'despesa',
      frequencia: 'mensal',
      diaBase: '1',
      proximaOcorrencia: format(new Date(), 'yyyy-MM-dd'),
      contaId: '',
      valor: '',
      categoriaId: '',
      descricao: '',
      tags: '',
      ativo: true
    });
  };

  const handleEdit = (recurrenceId: string) => {
    const recurrence = recurrences.find(r => r.id === recurrenceId);
    if (recurrence) {
      setFormData({
        tipo: recurrence.tipo,
        frequencia: recurrence.frequencia === 'custom' ? 'mensal' : recurrence.frequencia,
        diaBase: recurrence.diaBase.toString(),
        proximaOcorrencia: recurrence.proximaOcorrencia,
        contaId: recurrence.contaId,
        valor: Math.abs(recurrence.valor).toString(),
        categoriaId: recurrence.categoriaId || '',
        descricao: recurrence.descricao || '',
        tags: recurrence.tags,
        ativo: recurrence.ativo
      });
      setEditingRecurrence(recurrenceId);
      setIsDialogOpen(true);
    }
  };

  const handleToggleActive = (recurrenceId: string) => {
    const recurrence = recurrences.find(r => r.id === recurrenceId);
    if (recurrence) {
      updateRecurrence(recurrenceId, { ativo: !recurrence.ativo });
    }
  };

  const handleGenerate = (recurrenceId: string) => {
    generateRecurrenceTransactions(recurrenceId, 1);
  };

  const totalMonthlyIncome = activeRecurrences
    .filter(r => r.tipo === 'receita')
    .reduce((sum, r) => sum + Math.abs(r.valor), 0);

  const totalMonthlyExpenses = activeRecurrences
    .filter(r => r.tipo === 'despesa')
    .reduce((sum, r) => sum + Math.abs(r.valor), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Recorrências</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas recorrentes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Recorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRecurrence ? 'Editar Recorrência' : 'Nova Recorrência'}
              </DialogTitle>
              <DialogDescription>
                Configure uma transação que se repete automaticamente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: 'despesa' | 'receita') => setFormData({...formData, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select 
                    value={formData.frequencia} 
                    onValueChange={(value: 'mensal' | 'semanal' | 'anual') => setFormData({...formData, frequencia: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conta</Label>
                <Select 
                  value={formData.contaId} 
                  onValueChange={(value) => setFormData({...formData, contaId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  value={formData.categoriaId} 
                  onValueChange={(value) => setFormData({...formData, categoriaId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => c.tipo === formData.tipo)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Aluguel, Salário..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Próxima Ocorrência</Label>
                <Input
                  type="date"
                  value={formData.proximaOcorrencia}
                  onChange={(e) => setFormData({...formData, proximaOcorrencia: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="ativo">Ativa</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRecurrence ? 'Atualizar' : 'Criar'} Recorrência
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Mensais</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
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
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRecurrences.filter(r => r.tipo === 'despesa').length} recorrência{activeRecurrences.filter(r => r.tipo === 'despesa').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalMonthlyIncome - totalMonthlyExpenses >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferença entre receitas e despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Recorrências Ativas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recorrências Ativas</h2>
        
        {activeRecurrences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma recorrência ativa</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie recorrências para automatizar suas transações regulares
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Recorrência
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeRecurrences.map(recurrence => {
              const nextOccurrences = getNextOccurrences(recurrence);
              
              return (
                <Card key={recurrence.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{recurrence.descricao}</h3>
                          <Badge variant={recurrence.tipo === 'receita' ? 'default' : 'secondary'}>
                            {recurrence.tipo}
                          </Badge>
                          <Badge variant="outline">
                            {getFrequencyText(recurrence.frequencia)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p>Conta: {getAccountName(recurrence.contaId)}</p>
                            <p>Categoria: {getCategoryName(recurrence.categoriaId)}</p>
                          </div>
                          <div>
                            <p>Valor: <span className={`font-medium ${recurrence.tipo === 'receita' ? 'text-accent' : 'text-foreground'}`}>
                              {formatCurrency(Math.abs(recurrence.valor))}
                            </span></p>
                            <p>Próxima: {formatDate(recurrence.proximaOcorrencia)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerate(recurrence.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(recurrence.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(recurrence.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecurrence(recurrence.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recorrências Inativas */}
      {inactiveRecurrences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Recorrências Inativas</h2>
          <div className="grid gap-4">
            {inactiveRecurrences.map(recurrence => (
              <Card key={recurrence.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{recurrence.descricao}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Math.abs(recurrence.valor))} • {getFrequencyText(recurrence.frequencia)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(recurrence.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecurrence(recurrence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}