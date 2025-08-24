import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  FinanceState, 
  Account, 
  Category, 
  Transaction, 
  Recurrence, 
  Budget, 
  TransactionFilters, 
  FinancePreferences,
  AccountBalance,
  CategorySpending,
  BudgetStatus,
  UpcomingRecurrence,
  DashboardData,
  FinanceHistoryEntry
} from './types';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, isAfter, isBefore, addDays, addMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estados padrão
const defaultFilters: TransactionFilters = {
  accountIds: [],
  types: [],
  status: [],
  categoryIds: [],
  tags: [],
  search: '',
  sortBy: 'data',
  sortOrder: 'desc'
};

const defaultPreferences: FinancePreferences = {
  defaultCurrency: 'BRL',
  budgetAlertDays: 7,
  autoGenerateRecurrence: true
};

interface FinanceStore extends FinanceState {
  // Account actions
  createAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  archiveAccount: (id: string, archived: boolean) => void;
  
  // Category actions
  createCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Transaction actions
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  toggleTransactionStatus: (id: string) => void;
  createTransfer: (fromAccountId: string, toAccountId: string, valor: number, data: string, descricao?: string) => void;
  
  // Recurrence actions
  createRecurrence: (recurrence: Omit<Recurrence, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurrence: (id: string, updates: Partial<Recurrence>) => void;
  deleteRecurrence: (id: string) => void;
  generateRecurrenceTransactions: (id: string, count?: number) => void;
  generateMonthRecurrences: () => void;
  
  // Budget actions
  createBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Filter actions
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setSelectedTransactions: (ids: string[]) => void;
  
  // Preferences
  setPreferences: (preferences: Partial<FinancePreferences>) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Selectors
  getAccountBalance: (accountId: string) => AccountBalance;
  getTotalBalance: () => number;
  getFilteredTransactions: () => Transaction[];
  getCategorySpending: (categoryId: string, month?: string) => CategorySpending;
  getBudgetStatus: (budgetId: string) => BudgetStatus;
  getUpcomingRecurrences: (days?: number) => UpcomingRecurrence[];
  getDashboardData: () => DashboardData;
  
  // Export
  exportTransactionsCSV: (transactions?: Transaction[]) => string;
}

const saveToHistory = (store: FinanceState, action: string, data: any): FinanceState => {
  const newEntry: FinanceHistoryEntry = {
    action,
    timestamp: new Date(),
    data
  };
  
  const newHistory = store.history.slice(0, store.historyIndex + 1);
  newHistory.push(newEntry);
  
  // Manter apenas os últimos 50 entries
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  return {
    ...store,
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      accounts: [],
      categories: [],
      tags: [],
      transactions: [],
      recurrences: [],
      budgets: [],
      filterPresets: [],
      preferences: defaultPreferences,
      currentFilters: defaultFilters,
      selectedTransactions: [],
      history: [],
      historyIndex: -1,

      // Account actions
      createAccount: (accountData) => {
        const newAccount: Account = {
          ...accountData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => saveToHistory({
          ...state,
          accounts: [...state.accounts, newAccount]
        }, 'CREATE_ACCOUNT', newAccount));
        
        toast({
          title: "Conta criada!",
          description: `Conta "${newAccount.nome}" foi adicionada.`
        });
      },

      updateAccount: (id, updates) => {
        set((state) => {
          const account = state.accounts.find(a => a.id === id);
          if (!account) return state;
          
          return saveToHistory({
            ...state,
            accounts: state.accounts.map(a => 
              a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
            )
          }, 'UPDATE_ACCOUNT', { id, updates, previous: account });
        });
        
        toast({
          title: "Conta atualizada!",
          description: "As alterações foram salvas."
        });
      },

      deleteAccount: (id) => {
        set((state) => {
          const account = state.accounts.find(a => a.id === id);
          if (!account) return state;
          
          return saveToHistory({
            ...state,
            accounts: state.accounts.filter(a => a.id !== id),
            transactions: state.transactions.filter(t => t.contaId !== id)
          }, 'DELETE_ACCOUNT', account);
        });
        
        toast({
          title: "Conta excluída",
          description: "A conta e suas transações foram removidas."
        });
      },

      archiveAccount: (id, archived) => {
        get().updateAccount(id, { arquivada: archived });
        
        toast({
          title: archived ? "Conta arquivada" : "Conta reativada",
          description: archived ? "A conta foi arquivada." : "A conta foi reativada."
        });
      },

      // Category actions
      createCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: uuidv4(),
          createdAt: new Date()
        };
        
        set((state) => saveToHistory({
          ...state,
          categories: [...state.categories, newCategory]
        }, 'CREATE_CATEGORY', newCategory));
        
        toast({
          title: "Categoria criada!",
          description: `Categoria "${newCategory.nome}" foi adicionada.`
        });
      },

      updateCategory: (id, updates) => {
        set((state) => {
          const category = state.categories.find(c => c.id === id);
          if (!category) return state;
          
          return saveToHistory({
            ...state,
            categories: state.categories.map(c => 
              c.id === id ? { ...c, ...updates } : c
            )
          }, 'UPDATE_CATEGORY', { id, updates, previous: category });
        });
        
        toast({
          title: "Categoria atualizada!",
          description: "As alterações foram salvas."
        });
      },

      deleteCategory: (id) => {
        set((state) => {
          const category = state.categories.find(c => c.id === id);
          if (!category) return state;
          
          return saveToHistory({
            ...state,
            categories: state.categories.filter(c => c.id !== id),
            transactions: state.transactions.map(t => 
              t.categoriaId === id ? { ...t, categoriaId: undefined } : t
            )
          }, 'DELETE_CATEGORY', category);
        });
        
        toast({
          title: "Categoria excluída",
          description: "A categoria foi removida das transações."
        });
      },

      // Transaction actions
      createTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => saveToHistory({
          ...state,
          transactions: [...state.transactions, newTransaction]
        }, 'CREATE_TRANSACTION', newTransaction));
        
        toast({
          title: "Transação criada!",
          description: `${newTransaction.tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${newTransaction.valor.toFixed(2)} adicionada.`
        });
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;
          
          return saveToHistory({
            ...state,
            transactions: state.transactions.map(t => 
              t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
            )
          }, 'UPDATE_TRANSACTION', { id, updates, previous: transaction });
        });
        
        toast({
          title: "Transação atualizada!",
          description: "As alterações foram salvas."
        });
      },

      deleteTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;
          
          return saveToHistory({
            ...state,
            transactions: state.transactions.filter(t => t.id !== id)
          }, 'DELETE_TRANSACTION', transaction);
        });
        
        toast({
          title: "Transação excluída",
          description: "A transação foi removida."
        });
      },

      deleteTransactions: (ids) => {
        set((state) => {
          const transactions = state.transactions.filter(t => ids.includes(t.id));
          
          return saveToHistory({
            ...state,
            transactions: state.transactions.filter(t => !ids.includes(t.id)),
            selectedTransactions: []
          }, 'DELETE_TRANSACTIONS', transactions);
        });
        
        toast({
          title: "Transações excluídas",
          description: `${ids.length} transações foram removidas.`
        });
      },

      toggleTransactionStatus: (id) => {
        const transaction = get().transactions.find(t => t.id === id);
        if (!transaction) return;
        
        const newStatus = transaction.status === 'pendente' ? 'compensada' : 'pendente';
        get().updateTransaction(id, { status: newStatus });
        
        toast({
          title: newStatus === 'compensada' ? "Transação compensada!" : "Transação reaberta",
          description: newStatus === 'compensada' ? "O saldo foi atualizado." : "A transação voltou para pendente."
        });
      },

      createTransfer: (fromAccountId, toAccountId, valor, data, descricao) => {
        const linkId = uuidv4();
        
        const fromTransaction: Transaction = {
          id: uuidv4(),
          data,
          contaId: fromAccountId,
          valor: -valor,
          tipo: 'transferencia',
          descricao: descricao || 'Transferência',
          tags: '',
          status: 'compensada',
          meta: { linkId, direction: 'origem' },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const toTransaction: Transaction = {
          id: uuidv4(),
          data,
          contaId: toAccountId,
          valor,
          tipo: 'transferencia',
          descricao: descricao || 'Transferência',
          tags: '',
          status: 'compensada',
          meta: { linkId, direction: 'destino' },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => saveToHistory({
          ...state,
          transactions: [...state.transactions, fromTransaction, toTransaction]
        }, 'CREATE_TRANSFER', { fromTransaction, toTransaction }));
        
        toast({
          title: "Transferência criada!",
          description: `R$ ${valor.toFixed(2)} transferidos entre contas.`
        });
      },

      // Recurrence actions
      createRecurrence: (recurrenceData) => {
        const newRecurrence: Recurrence = {
          ...recurrenceData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      
        set((state) => saveToHistory({
          ...state,
          recurrences: [...state.recurrences, newRecurrence]
        }, 'CREATE_RECURRENCE', newRecurrence));
      
        toast({
          title: "Recorrência criada!",
          description: `Recorrência de ${newRecurrence.valor.toFixed(2)} criada.`
        });
      },
    
      updateRecurrence: (id, updates) => {
        set((state) => {
          const recurrence = state.recurrences.find(r => r.id === id);
          if (!recurrence) return state;
      
          return saveToHistory({
            ...state,
            recurrences: state.recurrences.map(r =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
            )
          }, 'UPDATE_RECURRENCE', { id, updates, previous: recurrence });
        });
      
        toast({
          title: "Recorrência atualizada!",
          description: "As alterações foram salvas."
        });
      },
    
      deleteRecurrence: (id) => {
        set((state) => {
          const recurrence = state.recurrences.find(r => r.id === id);
          if (!recurrence) return state;
      
          return saveToHistory({
            ...state,
            recurrences: state.recurrences.filter(r => r.id !== id)
          }, 'DELETE_RECURRENCE', recurrence);
        });
      
        toast({
          title: "Recorrência excluída",
          description: "A recorrência foi removida."
        });
      },
    
      generateRecurrenceTransactions: (id, count = 1) => {
        const recurrence = get().recurrences.find(r => r.id === id);
        if (!recurrence) return;
      
        let nextDate = new Date(recurrence.proximaOcorrencia);
        let generatedCount = 0;
      
        for (let i = 0; i < count; i++) {
          const newTransaction: Transaction = {
            id: uuidv4(),
            data: format(nextDate, 'yyyy-MM-dd'),
            contaId: recurrence.contaId,
            valor: recurrence.valor,
            tipo: recurrence.tipo,
            categoriaId: recurrence.categoriaId,
            descricao: recurrence.descricao,
            tags: recurrence.tags,
            status: 'pendente',
            createdAt: new Date(),
            updatedAt: new Date()
          };
      
          set((state) => ({
            ...state,
            transactions: [...state.transactions, newTransaction]
          }));
      
          generatedCount++;
      
          // Calcula a próxima ocorrência
          switch (recurrence.frequencia) {
            case 'mensal':
              nextDate = addMonths(nextDate, 1);
              break;
            case 'semanal':
              nextDate = addDays(nextDate, 7);
              break;
            case 'anual':
              nextDate = addMonths(nextDate, 12);
              break;
            // Implementar 'custom' se necessário
          }
        }
      
        // Atualiza a recorrência com a nova data
        get().updateRecurrence(id, { proximaOcorrencia: format(nextDate, 'yyyy-MM-dd') });
      
        toast({
          title: "Transações geradas!",
          description: `${generatedCount} transações geradas a partir da recorrência.`
        });
      },
    
      generateMonthRecurrences: () => {
        const recurrences = get().recurrences.filter(r => r.ativo);
        let generatedCount = 0;
      
        recurrences.forEach(recurrence => {
          const nextDate = new Date(recurrence.proximaOcorrencia);
          const endOfMonthDate = endOfMonth(new Date());
      
          if (isBefore(nextDate, endOfMonthDate) || isToday(nextDate)) {
            // Gera a transação
            const newTransaction: Transaction = {
              id: uuidv4(),
              data: format(nextDate, 'yyyy-MM-dd'),
              contaId: recurrence.contaId,
              valor: recurrence.valor,
              tipo: recurrence.tipo,
              categoriaId: recurrence.categoriaId,
              descricao: recurrence.descricao,
              tags: recurrence.tags,
              status: 'pendente',
              createdAt: new Date(),
              updatedAt: new Date()
            };
      
            set((state) => ({
              ...state,
              transactions: [...state.transactions, newTransaction]
            }));
      
            generatedCount++;
      
            // Calcula a próxima ocorrência
            let newNextDate: Date;
            switch (recurrence.frequencia) {
              case 'mensal':
                newNextDate = addMonths(nextDate, 1);
                break;
              case 'semanal':
                newNextDate = addDays(nextDate, 7);
                break;
              case 'anual':
                newNextDate = addMonths(nextDate, 12);
                break;
              default:
                newNextDate = addMonths(nextDate, 1);
                break;
            }
      
            // Atualiza a recorrência com a nova data
            get().updateRecurrence(recurrence.id, { proximaOcorrencia: format(newNextDate, 'yyyy-MM-dd') });
          }
        });
      
        toast({
          title: "Recorrências geradas!",
          description: `${generatedCount} transações geradas para o mês.`
        });
      },

      // Budget actions
      createBudget: (budgetData) => {
        const newBudget: Budget = {
          ...budgetData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      
        set((state) => saveToHistory({
          ...state,
          budgets: [...state.budgets, newBudget]
        }, 'CREATE_BUDGET', newBudget));
      
        toast({
          title: "Orçamento criado!",
          description: `Orçamento para ${budgetData.mesAno} criado.`
        });
      },
    
      updateBudget: (id, updates) => {
        set((state) => {
          const budget = state.budgets.find(b => b.id === id);
          if (!budget) return state;
      
          return saveToHistory({
            ...state,
            budgets: state.budgets.map(b =>
              b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
            )
          }, 'UPDATE_BUDGET', { id, updates, previous: budget });
        });
      
        toast({
          title: "Orçamento atualizado!",
          description: "As alterações foram salvas."
        });
      },
    
      deleteBudget: (id) => {
        set((state) => {
          const budget = state.budgets.find(b => b.id === id);
          if (!budget) return state;
      
          return saveToHistory({
            ...state,
            budgets: state.budgets.filter(b => b.id !== id)
          }, 'DELETE_BUDGET', budget);
        });
      
        toast({
          title: "Orçamento excluído",
          description: "O orçamento foi removido."
        });
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          ...state,
          currentFilters: { ...state.currentFilters, ...newFilters }
        }));
      },

      clearFilters: () => {
        set((state) => ({
          ...state,
          currentFilters: defaultFilters
        }));
      },

      setSelectedTransactions: (ids) => {
        set((state) => ({
          ...state,
          selectedTransactions: ids
        }));
      },

      setPreferences: (newPreferences) => {
        set((state) => ({
          ...state,
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },

      // Undo/Redo
      undo: () => {
        const state = get();
        if (state.historyIndex <= 0) return;
        
        set((currentState) => ({
          ...currentState,
          historyIndex: currentState.historyIndex - 1
        }));
        
        toast({
          title: "Ação desfeita",
          description: "A última ação foi revertida."
        });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;
        
        set((currentState) => ({
          ...currentState,
          historyIndex: currentState.historyIndex + 1
        }));
        
        toast({
          title: "Ação refeita",
          description: "A ação foi aplicada novamente."
        });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Selectors
      getAccountBalance: (accountId) => {
        const state = get();
        const account = state.accounts.find(a => a.id === accountId);
        if (!account) return {
          accountId,
          saldoAtual: 0,
          saldoInicial: 0,
          totalReceitas: 0,
          totalDespesas: 0,
          totalTransferenciasIn: 0,
          totalTransferenciasOut: 0
        };
        
        const transactions = state.transactions.filter(t => 
          t.contaId === accountId && t.status === 'compensada'
        );
        
        const totalReceitas = transactions
          .filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + t.valor, 0);
          
        const totalDespesas = transactions
          .filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
          
        const totalTransferenciasIn = transactions
          .filter(t => t.tipo === 'transferencia' && t.valor > 0)
          .reduce((sum, t) => sum + t.valor, 0);
          
        const totalTransferenciasOut = transactions
          .filter(t => t.tipo === 'transferencia' && t.valor < 0)
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
        
        const saldoAtual = account.saldoInicial + totalReceitas - totalDespesas + totalTransferenciasIn - totalTransferenciasOut;
        
        return {
          accountId,
          saldoAtual,
          saldoInicial: account.saldoInicial,
          totalReceitas,
          totalDespesas,
          totalTransferenciasIn,
          totalTransferenciasOut
        };
      },

      getTotalBalance: () => {
        const state = get();
        return state.accounts
          .filter(a => !a.arquivada)
          .reduce((total, account) => {
            const balance = get().getAccountBalance(account.id);
            return total + balance.saldoAtual;
          }, 0);
      },

      getFilteredTransactions: () => {
        const state = get();
        const { currentFilters } = state;
        let filtered = [...state.transactions];
        
        // Filter by period
        if (currentFilters.period) {
          const now = new Date();
          let startDate: Date, endDate: Date;
          
          switch (currentFilters.period) {
            case 'today':
              startDate = endDate = now;
              break;
            case 'this-week':
              startDate = startOfWeek(now, { locale: ptBR });
              endDate = endOfWeek(now, { locale: ptBR });
              break;
            case 'this-month':
              startDate = startOfMonth(now);
              endDate = endOfMonth(now);
              break;
            case 'last-month':
              const lastMonth = addMonths(now, -1);
              startDate = startOfMonth(lastMonth);
              endDate = endOfMonth(lastMonth);
              break;
          }
          
          if (startDate! && endDate!) {
            filtered = filtered.filter(t => {
              const transactionDate = new Date(t.data);
              return transactionDate >= startDate && transactionDate <= endDate;
            });
          }
        }
        
        // Custom date range
        if (currentFilters.startDate && currentFilters.endDate) {
          const startDate = new Date(currentFilters.startDate);
          const endDate = new Date(currentFilters.endDate);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.data);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
        }
        
        // Filter by accounts
        if (currentFilters.accountIds.length > 0) {
          filtered = filtered.filter(t => currentFilters.accountIds.includes(t.contaId));
        }
        
        // Filter by types
        if (currentFilters.types.length > 0) {
          filtered = filtered.filter(t => currentFilters.types.includes(t.tipo));
        }
        
        // Filter by status
        if (currentFilters.status.length > 0) {
          filtered = filtered.filter(t => currentFilters.status.includes(t.status));
        }
        
        // Filter by categories
        if (currentFilters.categoryIds.length > 0) {
          filtered = filtered.filter(t => 
            t.categoriaId && currentFilters.categoryIds.includes(t.categoriaId)
          );
        }
        
        // Filter by tags
        if (currentFilters.tags.length > 0) {
          filtered = filtered.filter(t => 
            currentFilters.tags.some(tag => t.tags.includes(tag))
          );
        }
        
        // Filter by search
        if (currentFilters.search) {
          const searchLower = currentFilters.search.toLowerCase();
          filtered = filtered.filter(t => 
            t.descricao?.toLowerCase().includes(searchLower) ||
            t.tags.toLowerCase().includes(searchLower)
          );
        }
        
        // Sort
        filtered.sort((a, b) => {
          const aVal = currentFilters.sortBy === 'data' ? new Date(a.data).getTime() :
                      currentFilters.sortBy === 'valor' ? Math.abs(a.valor) : 0;
          const bVal = currentFilters.sortBy === 'data' ? new Date(b.data).getTime() :
                      currentFilters.sortBy === 'valor' ? Math.abs(b.valor) : 0;
                      
          return currentFilters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
        
        return filtered;
      },

      getDashboardData: () => {
        const state = get();
        const now = new Date();
        const currentMonth = format(now, 'yyyy-MM');
        
        // Total balance
        const totalBalance = get().getTotalBalance();
        
        // Weekly due (próximos 7 dias, pendentes)
        const weekAhead = addDays(now, 7);
        const weeklyDue = state.transactions
          .filter(t => 
            t.status === 'pendente' && 
            new Date(t.data) >= now && 
            new Date(t.data) <= weekAhead &&
            t.tipo === 'despesa'
          )
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
        
        // Overdue (atrasadas)
        const overdue = state.transactions
          .filter(t => 
            t.status === 'pendente' && 
            new Date(t.data) < now &&
            t.tipo === 'despesa'
          )
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
        
        // Monthly income/expenses
        const monthlyTransactions = state.transactions.filter(t => 
          format(new Date(t.data), 'yyyy-MM') === currentMonth && 
          t.status === 'compensada'
        );
        
        const monthlyIncome = monthlyTransactions
          .filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + t.valor, 0);
          
        const monthlyExpenses = monthlyTransactions
          .filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
        
        return {
          totalBalance,
          weeklyDue,
          overdue,
          monthlyIncome,
          monthlyExpenses,
          topBudgets: [], // implementar depois
          upcomingRecurrences: [], // implementar depois
          dailyBalanceChart: [], // implementar depois
          expensesByCategory: [], // implementar depois
          monthlyComparison: [] // implementar depois
        };
      },

      exportTransactionsCSV: (transactions) => {
        const state = get();
        const data = transactions || get().getFilteredTransactions();
        
        const headers = ['Data', 'Conta', 'Tipo', 'Categoria', 'Descrição', 'Tags', 'Valor', 'Status'];
        const rows = data.map(t => {
          const account = state.accounts.find(a => a.id === t.contaId);
          const category = t.categoriaId ? state.categories.find(c => c.id === t.categoriaId) : null;
          
          return [
            format(new Date(t.data), 'dd/MM/yyyy'),
            account?.nome || '',
            t.tipo,
            category?.nome || '',
            t.descricao || '',
            t.tags,
            t.valor.toFixed(2),
            t.status
          ];
        });
        
        const csvContent = [headers, ...rows]
          .map(row => row.map(field => `\"${field}\"`).join(','))
          .join('\n');
        
        return csvContent;
      },

      getCategorySpending: (categoryId, month) => {
        const state = get();
        const category = state.categories.find(c => c.id === categoryId);
        const currentMonth = month || format(new Date(), 'yyyy-MM');
        
        const transactions = state.transactions.filter(t => 
          t.categoriaId === categoryId &&
          format(new Date(t.data), 'yyyy-MM') === currentMonth &&
          t.status === 'compensada' &&
          t.tipo === 'despesa'
        );
        
        const spent = transactions.reduce((sum, t) => sum + Math.abs(t.valor), 0);
        
        return {
          categoryId,
          categoryName: category?.nome || '',
          spent,
          transactions
        };
      },

      getBudgetStatus: (budgetId) => {
        const state = get();
        const budget = state.budgets.find(b => b.id === budgetId);
        if (!budget) {
          return {
            budgetId,
            categoryId: '',
            categoryName: '',
            valorPlanejado: 0,
            valorGasto: 0,
            percentage: 0,
            status: 'ok' as const,
            remainingDays: 0
          };
        }
        
        const categorySpending = get().getCategorySpending(budget.categoriaId, budget.mesAno);
        const percentage = budget.valorPlanejado > 0 ? (categorySpending.spent / budget.valorPlanejado) * 100 : 0;
        
        let status: 'ok' | 'warning' | 'exceeded' = 'ok';
        if (percentage >= 100) status = 'exceeded';
        else if (percentage >= 80) status = 'warning';
        
        const budgetDate = new Date(budget.mesAno + '-01');
        const endOfBudgetMonth = endOfMonth(budgetDate);
        const now = new Date();
        const remainingDays = Math.max(0, Math.ceil((endOfBudgetMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
          budgetId,
          categoryId: budget.categoriaId,
          categoryName: categorySpending.categoryName,
          valorPlanejado: budget.valorPlanejado,
          valorGasto: categorySpending.spent,
          percentage,
          status,
          remainingDays
        };
      },

      getUpcomingRecurrences: (days = 30) => {
        const state = get();
        const now = new Date();
        const futureDate = addDays(now, days);
        
        return state.recurrences
          .filter(r => r.ativo)
          .map(recurrence => {
            const nextDate = new Date(recurrence.proximaOcorrencia);
            const account = state.accounts.find(a => a.id === recurrence.contaId);
            
            return {
              recurrenceId: recurrence.id,
              nextDate: recurrence.proximaOcorrencia,
              description: recurrence.descricao || '',
              valor: recurrence.valor,
              accountName: account?.nome || 'Conta desconhecida',
              daysUntil: Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            };
          })
          .filter(r => {
            const rDate = new Date(r.nextDate);
            return rDate >= now && rDate <= futureDate;
          })
          .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
      }
    }),
    {
      name: 'finance-storage'
    }
  )
);
