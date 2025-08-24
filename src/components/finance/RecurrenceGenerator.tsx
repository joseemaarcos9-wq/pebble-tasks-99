import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Clock, 
  Calendar,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useFinanceStore } from '@/features/finance/store';
import { formatCurrency, formatDate } from '@/features/finance/utils/formatters';
import { format, addDays, isToday, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface RecurrenceGeneratorProps {
  className?: string;
  compact?: boolean;
}

export function RecurrenceGenerator({ 
  className = "",
  compact = false 
}: RecurrenceGeneratorProps) {
  const { 
    recurrences, 
    accounts, 
    generateRecurrenceTransactions,
    generateMonthRecurrences,
    transactions 
  } = useFinanceStore();
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Obter recorrências que podem ser geradas (próximas ou vencidas)
  const availableRecurrences = recurrences
    .filter(r => r.ativo)
    .map(recurrence => {
      const nextDate = new Date(recurrence.proximaOcorrencia);
      const account = accounts.find(a => a.id === recurrence.contaId);
      const today = new Date();
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Verifica se já existe transação para esta data
      const existingTransaction = transactions.find(t => 
        t.data === recurrence.proximaOcorrencia &&
        t.contaId === recurrence.contaId &&
        t.valor === recurrence.valor &&
        t.descricao === recurrence.descricao
      );

      return {
        ...recurrence,
        nextDate,
        accountName: account?.nome || 'Conta desconhecida',
        daysUntil,
        canGenerate: daysUntil <= 0 || isToday(nextDate),
        alreadyGenerated: !!existingTransaction,
        isOverdue: daysUntil < 0
      };
    })
    .filter(r => r.canGenerate && !r.alreadyGenerated)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  const handleGenerateAll = async () => {
    if (availableRecurrences.length === 0) return;
    
    setIsGenerating(true);
    try {
      generateMonthRecurrences();
      toast({
        title: "Recorrências geradas!",
        description: `${availableRecurrences.length} transações foram criadas.`
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar recorrências",
        description: "Tente novamente ou gere individualmente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateIndividual = (recurrenceId: string) => {
    generateRecurrenceTransactions(recurrenceId, 1);
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-destructive';
    if (daysUntil === 0) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const getUrgencyBadge = (daysUntil: number, isOverdue: boolean) => {
    if (isOverdue) return 'destructive';
    if (daysUntil === 0) return 'secondary';
    return 'outline';
  };

  if (availableRecurrences.length === 0) {
    return compact ? null : (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gerar Recorrências
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Tudo em dia!</h3>
          <p className="text-muted-foreground text-center text-sm">
            Não há recorrências pendentes para gerar no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {availableRecurrences.length} pendente{availableRecurrences.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="h-8"
          >
            <Zap className="h-3 w-3 mr-1" />
            Gerar todas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gerar Recorrências
          </div>
          <Badge variant="secondary">
            {availableRecurrences.length} pendente{availableRecurrences.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botão para gerar todas */}
        <Button
          className="w-full"
          onClick={handleGenerateAll}
          disabled={isGenerating}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : `Gerar todas (${availableRecurrences.length})`}
        </Button>

        <div className="space-y-2">
          {availableRecurrences.map((recurrence) => (
            <div 
              key={recurrence.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{recurrence.descricao}</p>
                  <Badge 
                    variant={recurrence.tipo === 'receita' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {recurrence.tipo}
                  </Badge>
                  {recurrence.isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      Atrasado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className={getUrgencyColor(recurrence.daysUntil)}>
                    {isToday(recurrence.nextDate) ? 'Hoje' : formatDate(recurrence.proximaOcorrencia)}
                  </span>
                  <span>•</span>
                  <span>{recurrence.accountName}</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    recurrence.tipo === 'receita' ? 'text-accent' : 'text-foreground'
                  }`}>
                    {formatCurrency(Math.abs(recurrence.valor))}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-16 text-xs"
                onClick={() => handleGenerateIndividual(recurrence.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                Gerar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}