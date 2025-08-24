import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/components/providers/DataProvider';
import { formatCurrency } from '../utils/formatters';
import { Plus, CreditCard, Wallet, DollarSign } from 'lucide-react';
import { AccountDialog } from '@/components/finance/AccountDialog';

export function FinanceAccounts() {
  const { finance: { accounts, getAccountBalance, getTotalBalance, loading } } = useData();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando contas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e carteiras</p>
        </div>
        <Button onClick={() => setIsAccountDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(getTotalBalance())}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} conta{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {accounts.map(account => {
          const balance = getAccountBalance(account.id);
          const Icon = account.tipo === 'cartao' ? CreditCard : Wallet;
          
          return (
            <Card key={account.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">{account.nome}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{account.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">
                      {formatCurrency(balance)}
                    </div>
                    <Badge variant="outline">{account.moeda}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AccountDialog 
        open={isAccountDialogOpen} 
        onOpenChange={setIsAccountDialogOpen} 
      />
    </div>
  );
}