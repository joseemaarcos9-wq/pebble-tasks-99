import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/components/providers/DataProvider';
import { TransactionDialog } from '@/components/finance/TransactionDialog';
import { Transaction, TransactionType, TransactionStatus } from '@/features/finance/types';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function FinanceTransactions() {
  const { finance: { transactions, accounts, categories, deleteTransaction, loading } } = useData();
  const { toast } = useToast();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth'>('all');

  const handleCreateTransaction = (type?: TransactionType) => {
    setSelectedTransaction(null);
    setDialogMode('create');
    setIsTransactionDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogMode('edit');
    setIsTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (confirm(`Tem certeza que deseja excluir a transação "${transaction.descricao || 'Sem descrição'}"?`)) {
      try {
        await deleteTransaction(transaction.id);
        toast({
          title: "Transação excluída",
          description: "A transação foi excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir transação",
          description: "Não foi possível excluir a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDialogClose = () => {
    setIsTransactionDialogOpen(false);
    setSelectedTransaction(null);
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

  const getStatusBadge = (status: TransactionStatus) => {
    const variants = {
      'pendente': 'secondary',
      'confirmada': 'default',
      'cancelada': 'destructive'
    } as const;
    
    const labels = {
      'pendente': 'Pendente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada'
    };
    
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'receita':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'despesa':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'transferencia':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.tipo === typeFilter);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Filtro por conta
    if (accountFilter !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.contaId === accountFilter || 
        transaction.contaDestinoId === accountFilter
      );
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.categoriaId === categoryFilter);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (dateFilter === 'thisMonth') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else { // lastMonth
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.data);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [transactions, searchTerm, typeFilter, statusFilter, accountFilter, categoryFilter, dateFilter]);

  const summary = useMemo(() => {
    const confirmedTransactions = filteredTransactions.filter(t => t.status === 'confirmada');
    const receitas = confirmedTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    const despesas = confirmedTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    const transferencias = confirmedTransactions
      .filter(t => t.tipo === 'transferencia')
      .reduce((sum, t) => sum + t.valor, 0);
    
    return {
      receitas,
      despesas,
      transferencias,
      saldo: receitas - despesas,
      total: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setAccountFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || 
    accountFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas, despesas e transferências</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleCreateTransaction('receita')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Receita
          </Button>
          <Button variant="outline" onClick={() => handleCreateTransaction('despesa')}>
            <TrendingDown className="h-4 w-4 mr-2" />
            Despesa
          </Button>
          <Button onClick={() => handleCreateTransaction()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.receitas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.despesas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferências</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.transferencias)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.saldo)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total}
            </div>
            <p className="text-xs text-muted-foreground">
              transações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.cor }}
                      />
                      {category.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={(value: string) => setDateFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters ? 'Nenhuma transação encontrada com os filtros aplicados' : 'Nenhuma transação encontrada'}
              </p>
              <Button onClick={() => handleCreateTransaction()}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira transação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.tipo);
              
              return (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(transaction.categoriaId) }}
                        />
                        {Icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {transaction.descricao || getCategoryName(transaction.categoriaId)}
                            </h3>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getAccountName(transaction.contaId)}</span>
                            {transaction.contaDestinoId && (
                              <>
                                <ArrowRightLeft className="h-3 w-3" />
                                <span>{getAccountName(transaction.contaDestinoId)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{format(parseISO(transaction.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            {transaction.categoriaId && (
                              <>
                                <span>•</span>
                                <span>{getCategoryName(transaction.categoriaId)}</span>
                              </>
                            )}
                          </div>
                          {transaction.tags && (
                            <div className="flex gap-1 mt-1">
                              {transaction.tags.split(',').map((tag, index) => (
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
                          <div className={cn(
                            "text-lg font-semibold",
                            transaction.tipo === 'receita' && "text-green-600",
                            transaction.tipo === 'despesa' && "text-red-600",
                            transaction.tipo === 'transferencia' && "text-blue-600"
                          )}>
                            {transaction.tipo === 'receita' && '+'}
                            {transaction.tipo === 'despesa' && '-'}
                            {formatCurrency(transaction.valor)}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <TransactionDialog 
        open={isTransactionDialogOpen}
        onOpenChange={handleDialogClose}
        transaction={selectedTransaction}
        mode={dialogMode}
      />
    </div>
  );
}