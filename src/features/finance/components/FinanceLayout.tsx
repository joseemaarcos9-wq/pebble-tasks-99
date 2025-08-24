import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  RefreshCw, 
  Wallet,
  Search,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FinanceLayoutProps {
  children?: React.ReactNode;
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/finance',
    icon: LayoutDashboard,
    shortcut: '1'
  },
  {
    label: 'Transações',
    href: '/finance/transactions',
    icon: ArrowLeftRight,
    shortcut: '2'
  },
  {
    label: 'Orçamentos',
    href: '/finance/budgets',
    icon: Target,
    shortcut: '3'
  },
  {
    label: 'Recorrências',
    href: '/finance/recurring',
    icon: RefreshCw,
    shortcut: '4'
  },
  {
    label: 'Contas',
    href: '/finance/accounts',
    icon: Wallet,
    shortcut: '5'
  }
];

export function FinanceLayout({ children }: FinanceLayoutProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/finance" className="flex items-center gap-2 text-xl font-semibold">
              <Wallet className="h-6 w-6 text-accent" />
              Controle Financeiro
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/finance' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-fast",
                      "hover:bg-accent/10 hover:text-accent",
                      isActive 
                        ? "bg-accent/15 text-accent font-medium" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <span className="hidden lg:inline text-xs opacity-60">
                      {item.shortcut}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar transações... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
                onFocus={() => {
                  // Implementar busca global
                }}
              />
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children || <Outlet />}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/finance' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-xs transition-fast",
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}