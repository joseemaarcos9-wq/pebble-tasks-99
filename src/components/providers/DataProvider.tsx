import React, { createContext, useContext } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useFinance } from '@/hooks/useFinance';
import { useProfile } from '@/hooks/useProfile';

interface DataContextType {
  tasks: ReturnType<typeof useTasks>;
  finance: ReturnType<typeof useFinance>;
  profile: ReturnType<typeof useProfile>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const tasks = useTasks();
  const finance = useFinance();
  const profile = useProfile();

  return (
    <DataContext.Provider value={{ tasks, finance, profile }}>
      {children}
    </DataContext.Provider>
  );
}