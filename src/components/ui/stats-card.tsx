import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    period?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  loading?: boolean;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50',
  warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50',
  danger: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className,
  loading = false
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value > 0) return 'text-green-600 dark:text-green-400';
    if (trend.value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className={cn(variantStyles[variant], className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
          {icon && <div className="h-4 w-4 bg-muted rounded animate-pulse" />}
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2" />
          <div className="h-3 bg-muted rounded animate-pulse w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          
          {trend && (
            <Badge 
              variant="outline" 
              className={cn(
                'ml-2 gap-1 text-xs',
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              {Math.abs(trend.value)}%
              {trend.label && ` ${trend.label}`}
            </Badge>
          )}
        </div>
        
        {trend?.period && (
          <p className="text-xs text-muted-foreground mt-1">
            vs {trend.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Grid container for stats cards
interface StatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}

// Specialized stats cards
interface MetricCardProps {
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  trend?: number;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  format = 'number',
  currency = 'BRL',
  trend,
  icon,
  className
}: MetricCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const trendData = trend !== undefined ? {
    value: trend,
    period: 'mês anterior'
  } : undefined;

  return (
    <StatsCard
      title={label}
      value={formatValue()}
      icon={icon}
      trend={trendData}
      className={className}
    />
  );
}