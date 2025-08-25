import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FinanceReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Relatórios</h1>
          <p className="text-muted-foreground">Análises financeiras em desenvolvimento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Os relatórios financeiros estão sendo desenvolvidos e estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}