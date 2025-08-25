import { useEffect } from 'react';

/**
 * Hook para gerenciar atalhos globais de teclado
 * Implementa navegação rápida e ações comuns
 */
interface KeyboardShortcuts {
  onNewTask?: () => void;
  onSearch?: () => void;
  onToggleList?: (index: number) => void;
  onUndo?: () => void; // Nova funcionalidade
}

/**
 * Configura e gerencia atalhos de teclado globais
 * Ignora eventos quando o usuário está digitando em campos de entrada
 */

export function useKeyboardShortcuts({ 
  onNewTask, 
  onSearch, 
  onToggleList, 
  onUndo 
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignora se o usuário está digitando em um campo de entrada
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as Element)?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Atalhos com Ctrl/Cmd (ações principais)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault();
            onUndo?.();
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

      // Atalhos de navegação e ação

      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          onNewTask?.();
          break;
        case '/':
          event.preventDefault();
          // Usar a função global de foco se disponível
          if ((window as Record<string, unknown>).focusSearch) {
            ((window as Record<string, unknown>).focusSearch as () => void)();
          } else {
            onSearch?.();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          event.preventDefault();
          const index = parseInt(event.key) - 1;
          onToggleList?.(index);
          break;
        }
        case 'escape':
          // Limpa foco de elementos
          (document.activeElement as HTMLElement)?.blur();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onSearch, onToggleList, onUndo]);
}