import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export function Loading({ 
  size = 'md', 
  className, 
  text, 
  fullScreen = false 
}: LoadingProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullScreen && 'min-h-[400px]',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton components for better loading states
export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-muted rounded animate-pulse flex-1" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}