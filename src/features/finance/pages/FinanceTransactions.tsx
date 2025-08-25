import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FinanceTransactions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transações</h1>
          <p className="text-muted-foreground">Histórico de transações em desenvolvimento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O módulo de transações está sendo desenvolvido e estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}