import { useEffect } from 'react';
import { useFinanceStore } from '../store';
import { createSeedData } from '../seed';

export function useInitializeFinanceData() {
  const { accounts, categories, transactions, budgets, recurrences } = useFinanceStore();
  const { createAccount, createCategory, createTransaction, createBudget } = useFinanceStore();

  useEffect(() => {
    // Só inicializa se não há dados
    if (accounts.length === 0 && categories.length === 0) {
      console.log('Inicializando dados financeiros...');
      
      const seedData = createSeedData();
      
      // Criar contas
      seedData.accounts.forEach(account => {
        const { id, createdAt, updatedAt, ...accountData } = account;
        createAccount(accountData);
      });
      
      // Criar categorias  
      seedData.categories.forEach(category => {
        const { id, createdAt, ...categoryData } = category;
        createCategory(categoryData);
      });
      
      // Esperar um pouco e criar transações
      setTimeout(() => {
        seedData.transactions.forEach(transaction => {
          const { id, createdAt, updatedAt, ...transactionData } = transaction;
          createTransaction(transactionData);
        });
        
        seedData.budgets.forEach(budget => {
          const { id, createdAt, updatedAt, ...budgetData } = budget;
          createBudget(budgetData);
        });
      }, 100);
    }
  }, []);
}