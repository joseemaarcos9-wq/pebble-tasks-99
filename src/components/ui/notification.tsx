import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  onDismiss?: (id: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
  }
};

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  persistent = false,
  onDismiss
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.(id);
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200',
        config.className,
        isLeaving ? 'opacity-0 scale-95 translate-x-full' : 'opacity-100 scale-100 translate-x-0'
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        {message && (
          <p className="mt-1 text-sm opacity-90">{message}</p>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Notification Container
interface NotificationContainerProps {
  notifications: NotificationProps[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<NotificationProps>) => 
    addNotification({ type: 'success', title, message, ...options });
    
  const error = (title: string, message?: string, options?: Partial<NotificationProps>) => 
    addNotification({ type: 'error', title, message, ...options });
    
  const warning = (title: string, message?: string, options?: Partial<NotificationProps>) => 
    addNotification({ type: 'warning', title, message, ...options });
    
  const info = (title: string, message?: string, options?: Partial<NotificationProps>) => 
    addNotification({ type: 'info', title, message, ...options });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}