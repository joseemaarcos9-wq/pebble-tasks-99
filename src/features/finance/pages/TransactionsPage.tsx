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
import { useData } from '@/components/providers/DataProvider';
import { formatCurrency, formatDate } from '../utils/formatters';
import { format } from 'date-fns';
import { TransactionDialog } from '@/components/finance/TransactionDialog';
import { toast } from '@/hooks/use-toast';

export function TransactionsPage() {
  const { 
    finance: {
      getFilteredTransactions, 
      accounts, 
      categories, 
      deleteTransaction, 
      filters,
      setFilters,
      clearFilters,
      loading
    }
  } = useData();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const transactions = getFilteredTransactions();
  
  // Show loading state
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

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.nome || 'Conta desconhecida';
  };

  const getCategoryName = (categoryId?: string) => {
    return categoryId ? categories.find(c => c.id === categoryId)?.nome || 'Sem categoria' : 'Sem categoria';
  };

  const handleExportCSV = () => {
    // TODO: Implementar exportação CSV
    toast({
      title: "Exportação não implementada",
      description: "Funcionalidade em desenvolvimento.",
      variant: "destructive"
    });
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
    const currentAccountIds = filters.accountIds;
    if (checked) {
      setFilters({ accountIds: [...currentAccountIds, accountId] });
    } else {
      setFilters({ accountIds: currentAccountIds.filter(id => id !== accountId) });
    }
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    const currentTypes = filters.types;
    if (checked) {
      setFilters({ types: [...currentTypes, type as any] });
    } else {
      setFilters({ types: currentTypes.filter(t => t !== type) });
    }
  };

  const handleStatusFilter = (status: string, checked: boolean) => {
    const currentStatus = filters.status;
    if (checked) {
      setFilters({ status: [...currentStatus, status as any] });
    } else {
      setFilters({ status: currentStatus.filter(s => s !== status) });
    }
  };

  const handleCategoryFilter = (categoryId: string, checked: boolean) => {
    const currentCategoryIds = filters.categoryIds;
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
    filters.search || 
    filters.period ||
    filters.accountIds.length > 0 ||
    filters.types.length > 0 ||
    filters.status.length > 0 ||
    filters.categoryIds.length > 0;

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
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filters.period || 'all'} onValueChange={handlePeriodChange}>
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
            </div>

            {/* Filtros ativos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Busca: "{filters.search}"
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
                {filters.period && (
                  <Badge variant="secondary" className="px-2 py-1">
                    Período: {filters.period}
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
                      <TableCell>{getAccountName(transaction.conta_id)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.tipo === 'receita' ? 'default' : 
                          transaction.tipo === 'despesa' ? 'secondary' : 
                          'outline'
                        }>
                          {transaction.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCategoryName(transaction.categoria_id)}</TableCell>
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