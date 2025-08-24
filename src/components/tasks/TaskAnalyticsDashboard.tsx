import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useTaskAnalytics } from '@/store/hooks/useTaskAnalytics';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar,
  Award,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#ff6b35', '#f7931e', '#ffd23f', '#06d6a0', '#118ab2'];

export function TaskAnalyticsDashboard() {
  const {
    getProductivityMetrics,
    getListAnalytics,
    getOverdueAnalytics,
    getTagAnalytics,
    getTimeToCompleteMetrics,
    exportAnalytics
  } = useTaskAnalytics();

  const weekMetrics = getProductivityMetrics('week');
  const monthMetrics = getProductivityMetrics('month');
  const listAnalytics = getListAnalytics();
  const overdueAnalytics = getOverdueAnalytics();
  const tagAnalytics = getTagAnalytics();
  const timeMetrics = getTimeToCompleteMetrics();

  const handleExportAnalytics = () => {
    const data = exportAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics de Tarefas</h2>
          <p className="text-muted-foreground">
            Insights sobre sua produtividade e desempenho
          </p>
        </div>
        <Button onClick={handleExportAnalytics} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{weekMetrics.completionRate}%</div>
                <div className="text-xs text-muted-foreground">Taxa de Conclusão (Semana)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{weekMetrics.averageTasksPerDay}</div>
                <div className="text-xs text-muted-foreground">Tarefas por Dia</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Clock className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{overdueAnalytics.total}</div>
                <div className="text-xs text-muted-foreground">Tarefas Atrasadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{timeMetrics.averageDays}</div>
                <div className="text-xs text-muted-foreground">Dias para Concluir</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes análises */}
      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="lists">Listas</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="time">Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tarefas por Dia - Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weekMetrics.dailyTasks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="created" fill="hsl(var(--primary))" name="Criadas" />
                    <Bar dataKey="completed" fill="hsl(var(--accent))" name="Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(weekMetrics.priorityDistribution).map(([priority, count]) => ({
                        name: priority,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.entries(weekMetrics.priorityDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comparação Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação: Semana vs Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Esta Semana</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-medium">{weekMetrics.totalTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Concluídas:</span>
                      <span className="font-medium">{weekMetrics.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa:</span>
                      <Badge variant="secondary">{weekMetrics.completionRate}%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Este Mês</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-medium">{monthMetrics.totalTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Concluídas:</span>
                      <span className="font-medium">{monthMetrics.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa:</span>
                      <Badge variant="secondary">{monthMetrics.completionRate}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <div className="grid gap-4">
            {listAnalytics.map(list => (
              <Card key={list.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: list.color || 'hsl(var(--muted))' }}
                      />
                      <div>
                        <h4 className="font-medium">{list.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {list.completed} de {list.total} tarefas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{list.completionRate}%</Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${list.completionRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <div className="grid gap-4">
            {tagAnalytics.slice(0, 10).map((tag, index) => (
              <Card key={tag.tag}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{tag.tag}</Badge>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {tag.completed} de {tag.count} tarefas
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{tag.completionRate}%</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{timeMetrics.averageDays}</div>
                  <div className="text-xs text-muted-foreground">Média de Dias</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{timeMetrics.medianDays}</div>
                  <div className="text-xs text-muted-foreground">Mediana de Dias</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-accent">{timeMetrics.fastest}</div>
                  <div className="text-xs text-muted-foreground">Mais Rápida</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-destructive">{timeMetrics.slowest}</div>
                  <div className="text-xs text-muted-foreground">Mais Lenta</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}