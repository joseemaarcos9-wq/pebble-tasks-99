import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/components/providers/DataProvider';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Download, 
  Calendar,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears,
  format,
  parseISO,
  isWithinInterval,
  eachMonthOfInterval,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

type ReportPeriod = 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'last6Months' | 'last12Months';

export function FinanceReports() {
  const { finance: { transactions, accounts, categories, budgets, loading } } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('thisMonth');

  const getPeriodDates = (period: ReportPeriod) => {
    const now = new Date();
    
    switch (period) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'lastYear': {
        const lastYear = subYears(now, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      case 'last6Months':
        return { start: subMonths(now, 6), end: now };
      case 'last12Months':
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const periodDates = getPeriodDates(selectedPeriod);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.data);
      return isWithinInterval(transactionDate, periodDates) && transaction.status === 'confirmada';
    });
  }, [transactions, periodDates]);

  const summary = useMemo(() => {
    const receitas = filteredTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    const despesas = filteredTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    const transferencias = filteredTransactions
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

  const categoryAnalysis = useMemo(() => {
    const categoryData = new Map();
    
    filteredTransactions.forEach(transaction => {
      if (transaction.categoriaId && transaction.tipo !== 'transferencia') {
        const category = categories.find(c => c.id === transaction.categoriaId);
        if (category) {
          const key = `${category.id}-${transaction.tipo}`;
          const existing = categoryData.get(key) || {
            id: category.id,
            nome: category.nome,
            cor: category.cor,
            tipo: transaction.tipo,
            valor: 0,
            count: 0
          };
          existing.valor += transaction.valor;
          existing.count += 1;
          categoryData.set(key, existing);
        }
      }
    });
    
    return Array.from(categoryData.values())
      .sort((a, b) => b.valor - a.valor);
  }, [filteredTransactions, categories]);

  const monthlyTrend = useMemo(() => {
    if (selectedPeriod === 'thisMonth' || selectedPeriod === 'lastMonth') {
      return [];
    }
    
    const months = eachMonthOfInterval(periodDates);
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.data);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd }) && 
               t.status === 'confirmada';
      });
      
      const receitas = monthTransactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      const despesas = monthTransactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });
  }, [transactions, periodDates, selectedPeriod]);

  const budgetAnalysis = useMemo(() => {
    const currentMonth = new Date();
    const currentMonthBudgets = budgets.filter(budget => {
      const budgetMonth = new Date(budget.ano, budget.mes - 1);
      return budgetMonth.getMonth() === currentMonth.getMonth() && 
             budgetMonth.getFullYear() === currentMonth.getFullYear();
    });
    
    return currentMonthBudgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoriaId);
      const spent = filteredTransactions
        .filter(t => t.categoriaId === budget.categoriaId && t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const percentage = (spent / budget.valorPlanejado) * 100;
      const remaining = budget.valorPlanejado - spent;
      
      return {
        ...budget,
        categoryName: category?.nome || 'Categoria não encontrada',
        categoryColor: category?.cor || '#6B7280',
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? 'exceeded' : 
                percentage > budget.limiteAlerta ? 'warning' : 'ok'
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, categories, filteredTransactions]);

  const accountBalances = useMemo(() => {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => 
        (t.contaId === account.id || t.contaDestinoId === account.id) && 
        t.status === 'confirmada'
      );
      
      let balance = account.saldoInicial;
      
      accountTransactions.forEach(transaction => {
        if (transaction.contaId === account.id) {
          if (transaction.tipo === 'receita') {
            balance += transaction.valor;
          } else if (transaction.tipo === 'despesa') {
            balance -= transaction.valor;
          } else if (transaction.tipo === 'transferencia') {
            balance -= transaction.valor;
          }
        }
        
        if (transaction.contaDestinoId === account.id && transaction.tipo === 'transferencia') {
          balance += transaction.valor;
        }
      });
      
      return {
        ...account,
        currentBalance: balance
      };
    }).sort((a, b) => b.currentBalance - a.currentBalance);
  }, [accounts, transactions]);

  const getPeriodLabel = (period: ReportPeriod) => {
    const labels = {
      'thisMonth': 'Este mês',
      'lastMonth': 'Mês passado',
      'thisYear': 'Este ano',
      'lastYear': 'Ano passado',
      'last6Months': 'Últimos 6 meses',
      'last12Months': 'Últimos 12 meses'
    };
    return labels[period];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: ReportPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
              <SelectItem value="thisYear">Este ano</SelectItem>
              <SelectItem value="lastYear">Ano passado</SelectItem>
              <SelectItem value="last6Months">Últimos 6 meses</SelectItem>
              <SelectItem value="last12Months">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.receitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel(selectedPeriod)}
            </p>
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
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel(selectedPeriod)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.saldo >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Total no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência Mensal */}
        {monthlyTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="despesas" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryAnalysis.filter(c => c.tipo === 'despesa').length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryAnalysis.filter(c => c.tipo === 'despesa').slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    label={({ nome, valor }) => `${nome}: ${formatCurrency(valor)}`}
                  >
                    {categoryAnalysis.filter(c => c.tipo === 'despesa').slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa encontrada no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise de Orçamentos */}
      {budgetAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análise de Orçamentos - {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAnalysis.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <div>
                      <h3 className="font-medium">{budget.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} de {formatCurrency(budget.valorPlanejado)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-semibold ${
                        budget.status === 'exceeded' ? 'text-red-600' :
                        budget.status === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {budget.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {budget.remaining >= 0 ? 'Restam' : 'Excedeu'} {formatCurrency(Math.abs(budget.remaining))}
                      </div>
                    </div>
                    <Badge variant={
                      budget.status === 'exceeded' ? 'destructive' :
                      budget.status === 'warning' ? 'secondary' :
                      'default'
                    }>
                      {budget.status === 'exceeded' ? (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Excedido</>
                      ) : budget.status === 'warning' ? (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Atenção</>
                      ) : (
                        'No limite'
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saldos das Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Saldos Atuais das Contas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {accountBalances.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: account.cor }}
                  />
                  <div>
                    <h3 className="font-medium">{account.nome}</h3>
                    <p className="text-sm text-muted-foreground">{account.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.currentBalance)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Inicial: {formatCurrency(account.saldoInicial)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Top Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalysis
                .filter(c => c.tipo === 'receita')
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.cor }}
                      />
                      <span className="font-medium">{category.nome}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(category.valor)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.count} transações
                      </div>
                    </div>
                  </div>
                ))
              }
              {categoryAnalysis.filter(c => c.tipo === 'receita').length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma receita encontrada no período
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Top Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalysis
                .filter(c => c.tipo === 'despesa')
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.cor }}
                      />
                      <span className="font-medium">{category.nome}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {formatCurrency(category.valor)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.count} transações
                      </div>
                    </div>
                  </div>
                ))
              }
              {categoryAnalysis.filter(c => c.tipo === 'despesa').length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma despesa encontrada no período
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}