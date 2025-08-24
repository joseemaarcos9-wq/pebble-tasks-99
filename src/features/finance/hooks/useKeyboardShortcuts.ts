import { useEffect } from 'react';

/**
 * Hook para atalhos de teclado específicos do módulo financeiro
 */
interface FinanceKeyboardShortcuts {
  onNewTransaction?: () => void;
  onNewRecurrence?: () => void;
  onNewBudget?: () => void;
  onToggleFilters?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useFinanceKeyboardShortcuts(shortcuts: FinanceKeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignora se o usuário está digitando em um campo
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as Element)?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Atalhos com Ctrl/Cmd
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              shortcuts.onRedo?.();
            } else {
              event.preventDefault();
              shortcuts.onUndo?.();
            }
            break;
          case 'e':
            event.preventDefault();
            shortcuts.onExport?.();
            break;
          default:
            break;
        }
        return;
      }

      // Ignora outros modificadores
      if (event.altKey || event.shiftKey) {
        return;
      }

      // Atalhos simples
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          shortcuts.onNewTransaction?.();
          break;
        case 't':
          event.preventDefault();
          shortcuts.onNewRecurrence?.();
          break;
        case 'b':
          event.preventDefault();
          shortcuts.onNewBudget?.();
          break;
        case 'f':
          event.preventDefault();
          shortcuts.onToggleFilters?.();
          break;
        case 'escape':
          // Limpa foco
          (document.activeElement as HTMLElement)?.blur();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}