import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { formatCurrency } from '../utils/formatters';
import { useInitializeFinanceData } from '../hooks/useInitializeFinanceData';
import { useUiStore } from '@/features/ui/store';
import { UpcomingRecurrences } from '@/components/finance/UpcomingRecurrences';
import { FinanceStatsCards } from '@/components/finance/FinanceStatsCards';
import { RecurrenceGenerator } from '@/components/finance/RecurrenceGenerator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export function FinanceDashboard() {
  useInitializeFinanceData();
  const { getDashboardData, accounts, getAccountBalance } = useFinanceStore();
  const { go } = useUiStore();
  const dashboardData = getDashboardData();

  // Dados simulados para os gráficos
  const dailyBalanceData = [
    { date: '01/12', balance: 3700 },
    { date: '02/12', balance: 3650 },
    { date: '03/12', balance: 3500 },
    { date: '04/12', balance: 3480 },
    { date: '05/12', balance: 8480 }, // Salário
    { date: '06/12', balance: 8450 },
    { date: '07/12', balance: 8300 },
    { date: '08/12', balance: 8270 },
    { date: '09/12', balance: 8200 },
    { date: '10/12', balance: 8150 }
  ];

  const expensesByCategoryData = [
    { category: 'Alimentação', value: 320, color: '#ef4444' },
    { category: 'Transporte', value: 145, color: '#3b82f6' },
    { category: 'Lazer', value: 114, color: '#10b981' },
    { category: 'Saúde', value: 46, color: '#f59e0b' }
  ];

  const monthlyComparisonData = [
    { month: 'Jul', receita: 5000, despesa: 4200 },
    { month: 'Ago', receita: 5000, despesa: 3800 },
    { month: 'Set', receita: 5000, despesa: 4100 },
    { month: 'Out', receita: 5000, despesa: 3900 },
    { month: 'Nov', receita: 5000, despesa: 4300 },
    { month: 'Dez', receita: 5000, despesa: 625 } // Mês atual parcial
  ];

  const upcomingRecurrences = [
    { id: '1', name: 'Aluguel', date: '05/01/2024', value: -1200, account: 'Banco Inter' },
    { id: '2', name: 'Salário', date: '05/01/2024', value: 5000, account: 'Banco Inter' },
    { id: '3', name: 'Internet', date: '10/01/2024', value: -89.90, account: 'Banco Inter' }
  ];

  return (
    <div data-testid="finance-dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <Button onClick={() => go('finance.transactions')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Cards de Resumo */}
      <FinanceStatsCards />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saldo Diário */}
        <Card>
          <CardHeader>
            <CardTitle>Saldo Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => go('finance.transactions')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Despesas por Categoria
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ category, value }) => `${category}: ${formatCurrency(value)}`}
                  labelLine={false}
                >
                  {expensesByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Receita vs Despesa, Próximas Recorrências e Gerador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita vs Despesa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita vs Despesa (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'receita' ? 'Receita' : 'Despesa'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="receita" fill="hsl(var(--accent))" name="receita" radius={[2, 2, 0, 0]} />
                <Bar dataKey="despesa" fill="hsl(var(--muted))" name="despesa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Próximas Recorrências */}
        <div className="space-y-6">
          <UpcomingRecurrences maxItems={3} />
          <RecurrenceGenerator compact />
        </div>
      </div>
    </div>
  );
}