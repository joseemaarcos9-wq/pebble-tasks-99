import { createContext, useContext, ReactNode } from 'react';
import { useNotifications, NotificationContainer } from '@/components/ui/notification';

interface NotificationContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    notifications,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll
  } = useNotifications();

  const contextValue: NotificationContextType = {
    success: (title: string, message?: string) => {
      success(title, message, { duration: 4000 });
    },
    error: (title: string, message?: string) => {
      error(title, message, { duration: 6000, persistent: false });
    },
    warning: (title: string, message?: string) => {
      warning(title, message, { duration: 5000 });
    },
    info: (title: string, message?: string) => {
      info(title, message, { duration: 4000 });
    },
    clearAll
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={removeNotification} 
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Utility hook for common notification patterns
export function useActionNotifications() {
  const { success, error, warning } = useNotification();

  return {
    // CRUD operations
    created: (itemType: string) => success(`${itemType} criado`, 'Item criado com sucesso'),
    updated: (itemType: string) => success(`${itemType} atualizado`, 'Alterações salvas com sucesso'),
    deleted: (itemType: string) => success(`${itemType} excluído`, 'Item removido com sucesso'),
    
    // Error patterns
    createError: (itemType: string) => error(`Erro ao criar ${itemType}`, 'Tente novamente em alguns instantes'),
    updateError: (itemType: string) => error(`Erro ao atualizar ${itemType}`, 'Verifique os dados e tente novamente'),
    deleteError: (itemType: string) => error(`Erro ao excluir ${itemType}`, 'Não foi possível remover o item'),
    loadError: (itemType: string) => error(`Erro ao carregar ${itemType}`, 'Verifique sua conexão'),
    
    // Validation
    validationError: (message: string) => warning('Dados inválidos', message),
    
    // Network
    networkError: () => error('Erro de conexão', 'Verifique sua conexão com a internet'),
    
    // Generic
    success,
    error,
    warning
  };
}