import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign,
  Calendar,
  ArrowRight,
  Target,
  Wallet
} from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { formatCurrency } from '@/features/finance/utils/formatters';
import { useUiStore } from '@/features/ui/store';

export function FinanceStatsCards() {
  const { finance: { accounts, getAccountBalance, getTotalBalance, transactions } } = useData();
  const { go } = useUiStore();
  
  const activeAccounts = accounts.filter(a => !a.arquivada);
  const totalActiveAccounts = activeAccounts.length;
  const totalBalance = getTotalBalance();
  
  // Calculate monthly income/expenses from transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.data);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  const monthlyIncome = thisMonthTransactions
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);
    
  const monthlyExpenses = Math.abs(thisMonthTransactions
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {totalActiveAccounts} conta{totalActiveAccounts !== 1 ? 's' : ''} ativa{totalActiveAccounts !== 1 ? 's' : ''}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={() => go('finance.accounts')}
          >
            Ver contas <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(monthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas realizadas
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={() => go('finance.transactions')}
          >
            Ver receitas <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Despesas realizadas
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={() => go('finance.transactions')}
          >
            Ver despesas <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalActiveAccounts}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <Wallet className="inline h-3 w-3 mr-1" />
            Contas gerenciadas
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={() => go('finance.budgets')}
          >
            Ver contas <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}