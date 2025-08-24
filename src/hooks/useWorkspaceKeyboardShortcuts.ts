import { useEffect, useState } from 'react';
import { useUiStore } from '@/features/ui/store';

interface KeySequence {
  keys: string[];
  action: () => void;
  description: string;
}

export function useWorkspaceKeyboardShortcuts() {
  const { go } = useUiStore();
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [sequenceTimeout, setSequenceTimeout] = useState<NodeJS.Timeout | null>(null);

  const shortcuts: KeySequence[] = [
    {
      keys: ['g', 't'],
      action: () => go('tasks.home'),
      description: 'Ir para Tarefas'
    },
    {
      keys: ['g', 'f'],
      action: () => go('finance.dashboard'),
      description: 'Ir para Financeiro'
    },
    {
      keys: ['g', 'f', 'd'],
      action: () => go('finance.dashboard'),
      description: 'Ir para Dashboard Financeiro'
    },
    {
      keys: ['g', 'f', 't'],
      action: () => go('finance.transactions'),
      description: 'Ir para Transações'
    },
    {
      keys: ['g', 'f', 'b'],
      action: () => go('finance.budgets'),
      description: 'Ir para Orçamentos'
    },
    {
      keys: ['g', 'f', 'r'],
      action: () => go('finance.recurring'),
      description: 'Ir para Recorrências'
    },
    {
      keys: ['g', 'f', 'a'],
      action: () => go('finance.accounts'),
      description: 'Ir para Contas'
    },
    {
      keys: ['g', 's'],
      action: () => go('settings'),
      description: 'Ir para Configurações'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger if modifier keys are pressed (except for specific combos)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Build the key sequence
      const newSequence = [...keySequence, key];
      
      // Clear existing timeout
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }

      // Check if any shortcut matches this sequence
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.keys.length === newSequence.length &&
        shortcut.keys.every((k, i) => k === newSequence[i])
      );

      if (matchingShortcut) {
        // Execute the shortcut
        e.preventDefault();
        matchingShortcut.action();
        setKeySequence([]);
        return;
      }

      // Check if this sequence could be the start of a longer shortcut
      const hasPartialMatch = shortcuts.some(shortcut =>
        shortcut.keys.length > newSequence.length &&
        newSequence.every((k, i) => k === shortcut.keys[i])
      );

      if (hasPartialMatch) {
        // Continue building the sequence
        e.preventDefault();
        setKeySequence(newSequence);
        
        // Set timeout to reset sequence after 1 second
        const timeout = setTimeout(() => {
          setKeySequence([]);
        }, 1000);
        setSequenceTimeout(timeout);
      } else {
        // No match, reset sequence
        setKeySequence([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [keySequence, sequenceTimeout, go, shortcuts]);

  return {
    keySequence: keySequence.join(' '),
    shortcuts: shortcuts.map(s => ({
      keys: s.keys.join(' '),
      description: s.description
    }))
  };
}