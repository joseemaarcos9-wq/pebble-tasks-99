import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Filter, Download, Edit, Trash2, ChevronDown, X, Calendar } from 'lucide-react';
import { useFinanceStore } from '../store';
import { formatCurrency, formatDate } from '../utils/formatters';
import { format } from 'date-fns';
import { useInitializeFinanceData } from '../hooks/useInitializeFinanceData';
import { TransactionDialog } from '@/components/finance/TransactionDialog';
import { toast } from '@/hooks/use-toast';

export function TransactionsPage() {
  useInitializeFinanceData();
  const { 
    getFilteredTransactions, 
    accounts, 
    categories, 
    deleteTransaction, 
    toggleTransactionStatus, 
    exportTransactionsCSV,
    currentFilters,
    setFilters,
    clearFilters
  } = useFinanceStore();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const transactions = getFilteredTransactions();

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.nome || 'Conta desconhecida';
  };

  const getCategoryName = (categoryId?: string) => {
    return categoryId ? categories.find(c => c.id === categoryId)?.nome || 'Sem categoria' : 'Sem categoria';
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportTransactionsCSV(transactions);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída!",
        description: `${transactions.length} transações exportadas para CSV.`
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar as transações.",
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handlePeriodChange = (period: string) => {
    if (period === 'all') {
      setFilters({ period: undefined, startDate: undefined, endDate: undefined });
    } else {
      setFilters({ period: period as any });
    }
  };

  const handleAccountFilter = (accountId: string, checked: boolean) => {
    const currentAccountIds = currentFilters.accountIds;
    if (checked) {
      setFilters({ accountIds: [...currentAccountIds, accountId] });
    } else {
      setFilters({ accountIds: currentAccountIds.filter(id => id !== accountId) });
    }
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    const currentTypes = currentFilters.types;
    if (checked) {
      setFilters({ types: [...currentTypes, type as any] });
    } else {
      setFilters({ types: currentTypes.filter(t => t !== type) });
    }
  };

  const handleStatusFilter = (status: string, checked: boolean) => {
    const currentStatus = currentFilters.status;
    if (checked) {
      setFilters({ status: [...currentStatus, status as any] });
    } else {
      setFilters({ status: currentStatus.filter(s => s !== status) });
    }
  };

  const handleCategoryFilter = (categoryId: string, checked: boolean) => {
    const currentCategoryIds = currentFilters.categoryIds;
    if (checked) {
      setFilters({ categoryIds: [...currentCategoryIds, categoryId] });
    } else {
      setFilters({ categoryIds: currentCategoryIds.filter(id => id !== categoryId) });
    }
  };

  const clearAllFilters = () => {
    clearFilters();
    setFiltersOpen(false);
  };

  const hasActiveFilters = 
    currentFilters.search || 
    currentFilters.period ||
    currentFilters.accountIds.length > 0 ||
    currentFilters.types.length > 0 ||
    currentFilters.status.length > 0 ||
    currentFilters.categoryIds.length > 0;

  return (
    <div data-testid="tx-table" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => setTransactionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca e período */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transações..."
                    value={currentFilters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={currentFilters.period || 'all'} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="this-week">Esta semana</SelectItem>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                </SelectContent>
              </Select>
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Mais Filtros
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border rounded-lg bg-muted/30">
                    {/* Contas */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Contas</Label>
                      <div className="space-y-2">
                        {accounts.map((account) => (
                          <div key={account.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`account-${account.id}`}
                              checked={currentFilters.accountIds.includes(account.id)}
                              onCheckedChange={(checked) => handleAccountFilter(account.id, !!checked)}
                            />
                            <Label 
                              htmlFor={`account-${account.id}`} 
                              className="text-sm text-foreground cursor-pointer"
                            >
                              {account.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tipos */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Tipos</Label>
                      <div className="space-y-2">
                        {['receita', 'despesa', 'transferencia'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`type-${type}`}
                              checked={currentFilters.types.includes(type as any)}
                              onCheckedChange={(checked) => handleTypeFilter(type, !!checked)}
                            />
                            <Label 
                              htmlFor={`type-${type}`} 
                              className="text-sm text-foreground cursor-pointer capitalize"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="space-y-2">
                        {['pendente', 'compensada'].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`status-${status}`}
                              checked={currentFilters.status.includes(status as any)}
                              onCheckedChange={(checked) => handleStatusFilter(status, !!checked)}
                            />
                            <Label 
                              htmlFor={`status-${status}`} 
                              className="text-sm text-foreground cursor-pointer capitalize"
                            >
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categorias */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Categorias</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.id}`}
                              checked={currentFilters.categoryIds.includes(category.id)}
                              onCheckedChange={(checked) => handleCategoryFilter(category.id, !!checked)}
                            />
                            <Label 
                              htmlFor={`category-${category.id}`} 
                              className="text-sm text-foreground cursor-pointer"
                            >
                              {category.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Filtros ativos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {currentFilters.search && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Busca: "{currentFilters.search}"
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => setFilters({ search: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {currentFilters.period && (
                  <Badge variant="secondary" className="px-2 py-1">
                    {currentFilters.period === 'today' && 'Hoje'}
                    {currentFilters.period === 'this-week' && 'Esta semana'}
                    {currentFilters.period === 'this-month' && 'Este mês'}
                    {currentFilters.period === 'last-month' && 'Mês passado'}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => setFilters({ period: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {currentFilters.accountIds.map(accountId => {
                  const account = accounts.find(a => a.id === accountId);
                  return account ? (
                    <Badge key={accountId} variant="secondary" className="px-2 py-1">
                      {account.nome}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 ml-1"
                        onClick={() => handleAccountFilter(accountId, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
                {currentFilters.types.map(type => (
                  <Badge key={type} variant="secondary" className="px-2 py-1 capitalize">
                    {type}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => handleTypeFilter(type, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {currentFilters.status.map(status => (
                  <Badge key={status} variant="secondary" className="px-2 py-1 capitalize">
                    {status}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => handleStatusFilter(status, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {hasActiveFilters ? 'Nenhuma transação encontrada com os filtros aplicados.' : 'Nenhuma transação encontrada.'}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.data)}</TableCell>
                      <TableCell>{getAccountName(transaction.contaId)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.tipo === 'receita' ? 'default' : 
                          transaction.tipo === 'despesa' ? 'secondary' : 
                          'outline'
                        }>
                          {transaction.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCategoryName(transaction.categoriaId)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.descricao || '-'}
                      </TableCell>
                      <TableCell className={
                        transaction.valor > 0 ? 'text-accent font-medium' : 'text-foreground'
                      }>
                        {formatCurrency(Math.abs(transaction.valor))}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.status === 'compensada' ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleTransactionStatus(transaction.id)}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionDialog 
        open={transactionDialogOpen} 
        onOpenChange={setTransactionDialogOpen} 
      />
    </div>
  );
}