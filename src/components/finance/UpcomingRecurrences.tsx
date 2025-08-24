import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Clock, ArrowRight } from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { formatCurrency, formatDate } from '@/features/finance/utils/formatters';
import { useUiStore } from '@/features/ui/store';
import { format, addDays, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingRecurrencesProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export function UpcomingRecurrences({ 
  maxItems = 5, 
  showHeader = true,
  className = "" 
}: UpcomingRecurrencesProps) {
  const { finance } = useData();
  const { 
    recurrences, 
    accounts, 
    categories
  } = finance;
  const { go } = useUiStore();

  // Obter recorrências ativas ordenadas por proximidade da data
  const activeRecurrences = recurrences
    .filter(r => r.ativo)
    .map(recurrence => {
      const nextDate = new Date(recurrence.proxima_ocorrencia);
      const account = accounts.find(a => a.id === recurrence.conta_id);
      const category = categories.find(c => c.id === recurrence.categoria_id);
      
      return {
        ...recurrence,
        nextDate,
        accountName: account?.nome || 'Conta desconhecida',
        categoryName: category?.nome || 'Sem categoria',
        daysUntil: Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      };
    })
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, maxItems);

  const getDateLabel = (date: Date, daysUntil: number) => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isThisWeek(date) && daysUntil <= 7) {
      return format(date, 'EEEE', { locale: ptBR });
    }
    return formatDate(date.toISOString().split('T')[0]);
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 0) return 'text-destructive';
    if (daysUntil <= 3) return 'text-orange-500';
    if (daysUntil <= 7) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getUrgencyBadge = (daysUntil: number) => {
    if (daysUntil <= 0) return 'destructive';
    if (daysUntil <= 3) return 'secondary';
    return 'outline';
  };

  // Remove generateRecurrenceTransactions since it's not implemented yet

  if (activeRecurrences.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Recorrências
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma recorrência configurada</h3>
          <p className="text-muted-foreground text-center mb-4 text-sm">
            Configure recorrências para automatizar suas transações regulares
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => go('finance.recurring')}
          >
            Configurar Recorrências
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Recorrências
            </div>
            <Badge variant="secondary" className="text-xs">
              {activeRecurrences.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {activeRecurrences.map((recurrence) => (
          <div 
            key={recurrence.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{recurrence.descricao}</p>
                <Badge 
                  variant={recurrence.tipo === 'receita' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {recurrence.tipo}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className={getUrgencyColor(recurrence.daysUntil)}>
                  {getDateLabel(recurrence.nextDate, recurrence.daysUntil)}
                </span>
                <span>•</span>
                <span>{recurrence.accountName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`font-semibold text-sm ${
                  recurrence.tipo === 'receita' ? 'text-accent' : 'text-foreground'
                }`}>
                  {formatCurrency(Math.abs(recurrence.valor))}
                </div>
                {recurrence.daysUntil <= 7 && (
                  <Badge 
                    variant={getUrgencyBadge(recurrence.daysUntil)} 
                    className="text-xs mt-1"
                  >
                    {recurrence.daysUntil <= 0 ? 'Vencido' : `${recurrence.daysUntil}d`}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-16 text-xs hover:bg-accent/10"
                disabled
                title="Funcionalidade em desenvolvimento"
              >
                Gerar
              </Button>
            </div>
          </div>
        ))}
        
        {recurrences.filter(r => r.ativo).length > maxItems && (
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            size="sm"
            onClick={() => go('finance.recurring')}
          >
            Ver todas recorrências
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}