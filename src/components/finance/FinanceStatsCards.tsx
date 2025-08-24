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
import { useFinanceStore } from '@/features/finance/store';
import { formatCurrency } from '@/features/finance/utils/formatters';
import { useUiStore } from '@/features/ui/store';

export function FinanceStatsCards() {
  const { getDashboardData, accounts, getAccountBalance } = useFinanceStore();
  const { go } = useUiStore();
  const dashboardData = getDashboardData();

  const activeAccounts = accounts.filter(a => !a.arquivada);
  const totalActiveAccounts = activeAccounts.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(dashboardData.totalBalance)}
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
          <CardTitle className="text-sm font-medium">A Receber Esta Semana</CardTitle>
          <Calendar className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(dashboardData.weeklyDue > 0 ? dashboardData.weeklyDue : 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas programadas
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
          <CardTitle className="text-sm font-medium">A Pagar Esta Semana</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(Math.abs(dashboardData.weeklyDue < 0 ? dashboardData.weeklyDue : 0))}
          </div>
          <p className="text-xs text-muted-foreground">
            Despesas programadas
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
          <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(Math.abs(dashboardData.monthlyExpenses))}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingDown className="inline h-3 w-3 mr-1" />
            Despesas realizadas
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-primary"
            onClick={() => go('finance.budgets')}
          >
            Ver orçamentos <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}