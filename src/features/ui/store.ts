import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Section =
  | 'tasks.home'
  | 'tasks.detail'
  | 'finance.dashboard'
  | 'finance.transactions'
  | 'finance.budgets'
  | 'finance.recurring'
  | 'finance.accounts'
  | 'settings';

interface UiState {
  section: Section;
  sectionParams?: Record<string, unknown> | null;
  history: Array<{ section: Section; params?: Record<string, unknown> }>;
  
  // Actions
  go: (section: Section, params?: Record<string, unknown>, pushHistory?: boolean) => void;
  back: () => void;
  reset: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      section: 'tasks.home',
      sectionParams: null,
      history: [],

      go: (section, params = null, pushHistory = true) => {
        const current = get();
        
        set((state) => ({
          section,
          sectionParams: params,
          history: pushHistory 
            ? [...state.history.slice(-9), { section: current.section, params: current.sectionParams }]
            : state.history
        }));
      },

      back: () => {
        const { history } = get();
        if (history.length === 0) return;
        
        const previous = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        
        set({
          section: previous.section,
          sectionParams: previous.params,
          history: newHistory
        });
      },

      reset: () => {
        set({
          section: 'tasks.home',
          sectionParams: null,
          history: []
        });
      }
    }),
    {
      name: 'workspace-ui-state',
      partialize: (state) => ({ 
        section: state.section, 
        sectionParams: state.sectionParams 
      })
    }
  )
);