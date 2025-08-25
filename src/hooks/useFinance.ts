import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Types matching database schema
export interface FinanceAccount {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'carteira' | 'banco' | 'cartao';
  saldo_inicial: number;
  moeda: string;
  cor: string | null;
  arquivada: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'despesa' | 'receita';
  parent_id: string | null;
  cor: string | null;
  created_at: string;
}

export interface FinanceTag {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
}

export interface FinanceTransaction {
  id: string;
  user_id: string;
  conta_id: string;
  categoria_id: string | null;
  valor: number;
  tipo: 'despesa' | 'receita' | 'transferencia';
  descricao: string | null;
  tags: string;
  anexo_url: string | null;
  status: 'pendente' | 'compensada';
  data: string;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FinanceRecurrence {
  id: string;
  user_id: string;
  conta_id: string;
  categoria_id: string | null;
  tipo: 'despesa' | 'receita'; // Não inclui transferencia conforme constraint do DB
  frequencia: 'mensal' | 'semanal' | 'anual' | 'custom';
  dia_base: number;
  proxima_ocorrencia: string;
  valor: number;
  descricao: string | null;
  tags: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceBudget {
  id: string;
  user_id: string;
  categoria_id: string;
  valor_planejado: number;
  mes_ano: string;
  alert_threshold_pct: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  period?: 'today' | 'this-week' | 'this-month' | 'last-month' | 'custom';
  startDate?: string;
  endDate?: string;
  accountIds: string[];
  types: ('despesa' | 'receita' | 'transferencia')[];
  status: ('pendente' | 'compensada')[];
  categoryIds: string[];
  tags: string[];
  search: string;
  sortBy: 'data' | 'valor' | 'conta' | 'categoria';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: TransactionFilters = {
  accountIds: [],
  types: [],
  status: [],
  categoryIds: [],
  tags: [],
  search: '',
  sortBy: 'data',
  sortOrder: 'desc',
};

export function useFinance() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [recurrences, setRecurrences] = useState<FinanceRecurrence[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudget[]>([]);
  const [filters, setFiltersState] = useState<TransactionFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setCategories([]);
      setTags([]);
      setTransactions([]);
      setRecurrences([]);
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch in parallel for better performance
      const [
        accountsResult,
        categoriesResult,
        tagsResult,
        transactionsResult,
        recurrencesResult,
        budgetsResult
      ] = await Promise.all([
        supabase.from('finance_accounts').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('finance_categories').select('*').eq('user_id', user.id).order('nome'),
        supabase.from('finance_tags').select('*').eq('user_id', user.id).order('nome'),
        supabase.from('finance_transactions').select('*').eq('user_id', user.id).order('data', { ascending: false }),
        supabase.from('finance_recurrences').select('*').eq('user_id', user.id).order('proxima_ocorrencia'),
        supabase.from('finance_budgets').select('*').eq('user_id', user.id).order('mes_ano', { ascending: false }),
      ]);

      if (accountsResult.error) throw accountsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (tagsResult.error) throw tagsResult.error;
      if (transactionsResult.error) throw transactionsResult.error;
      if (recurrencesResult.error) throw recurrencesResult.error;
      if (budgetsResult.error) throw budgetsResult.error;

      setAccounts(accountsResult.data || []);
      setCategories(categoriesResult.data || []);
      setTags(tagsResult.data || []);
      setTransactions(transactionsResult.data || []);
      setRecurrences((recurrencesResult.data || []) as FinanceRecurrence[]);
      setBudgets(budgetsResult.data || []);
    } catch (error: unknown) {
      console.error('Error fetching finance data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao carregar dados financeiros",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Account operations
  const addAccount = useCallback(async (accountData: Omit<FinanceAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('finance_accounts')
        .insert({
          ...accountData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data]);
      toast({
        title: "Conta criada!",
        description: `"${data.nome}" foi adicionada.`,
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  const updateAccount = useCallback(async (id: string, updates: Partial<FinanceAccount>) => {
    try {
      const { data, error } = await supabase
        .from('finance_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => prev.map(account => account.id === id ? data : account));
      toast({
        title: "Conta atualizada!",
        description: "As alterações foram salvas.",
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar conta",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  // Transaction operations
  const addTransaction = useCallback(async (transactionData: Omit<FinanceTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Transação criada!",
        description: "A transação foi registrada com sucesso.",
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar transação",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<FinanceTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => prev.map(transaction => transaction.id === id ? data : transaction));
      toast({
        title: "Transação atualizada!",
        description: "As alterações foram salvas.",
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar transação",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast({
        title: "Transação excluída",
        description: "A transação foi removida.",
      });

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao excluir transação",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  // Category operations
  const addCategory = useCallback(async (categoryData: Omit<FinanceCategory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('finance_categories')
        .insert({
          ...categoryData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Categoria criada!",
        description: `"${data.nome}" foi adicionada.`,
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar categoria",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  // Budget operations
  const addBudget = useCallback(async (budgetData: Omit<FinanceBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('finance_budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => [...prev, data]);
      toast({
        title: "Orçamento criado!",
        description: "O orçamento foi registrado com sucesso.",
      });

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar orçamento",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  }, [user]);

  // Computed values
  const getAccountBalance = useCallback((accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;

    const accountTransactions = transactions.filter(t => t.conta_id === accountId);
    
    const receitas = accountTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = accountTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Math.abs(t.valor), 0); // Use Math.abs para garantir valor positivo

    return account.saldo_inicial + receitas - despesas;
  }, [accounts, transactions]);

  const getTotalBalance = useCallback(() => {
    return accounts.reduce((total, account) => {
      return total + getAccountBalance(account.id);
    }, 0);
  }, [accounts, getAccountBalance]);

  const getFilteredTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Apply filters
    if (filters.accountIds.length > 0) {
      filtered = filtered.filter(t => filters.accountIds.includes(t.conta_id));
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(t => filters.types.includes(t.tipo));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status));
    }

    if (filters.categoryIds.length > 0) {
      filtered = filtered.filter(t => t.categoria_id && filters.categoryIds.includes(t.categoria_id));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.descricao?.toLowerCase().includes(searchLower) ||
        t.tags.toLowerCase().includes(searchLower)
      );
    }

    // Period filter
    if (filters.period && filters.period !== 'custom') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.data);
        
        switch (filters.period) {
          case 'today':
            return transactionDate.toDateString() === today.toDateString();
          case 'this-week': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          }
          case 'this-month':
            return transactionDate.getMonth() === today.getMonth() && 
                   transactionDate.getFullYear() === today.getFullYear();
          case 'last-month': {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return transactionDate.getMonth() === lastMonth.getMonth() && 
                   transactionDate.getFullYear() === lastMonth.getFullYear();
          }
          default:
            return true;
        }
      });
    }

    // Custom date range
    if (filters.startDate) {
      filtered = filtered.filter(t => t.data >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.data <= filters.endDate!);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (filters.sortBy) {
        case 'data':
          aValue = new Date(a.data);
          bValue = new Date(b.data);
          break;
        case 'valor':
          aValue = a.valor;
          bValue = b.valor;
          break;
        default:
          aValue = a.data;
          bValue = b.data;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, filters]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Load data on mount and user change
  useEffect(() => {
    fetchAllData();
  }, [user, fetchAllData]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('finance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'finance_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'finance_accounts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAllData]);

  return {
    // Data
    accounts,
    categories,
    tags,
    transactions,
    recurrences,
    budgets,
    filters,
    loading,

    // Account operations
    addAccount,
    updateAccount,

    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Category operations
    addCategory,

    // Budget operations
    addBudget,

    // Computed values
    getAccountBalance,
    getTotalBalance,
    getFilteredTransactions,

    // Filter operations
    setFilters,
    clearFilters,

    // Utilities
    refetch: fetchAllData,
  };
}