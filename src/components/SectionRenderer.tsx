import { motion } from 'framer-motion';
import { useUiStore } from '@/features/ui/store';
import { TasksHome } from '@/features/tasks/pages/TasksHome';
import { FinanceDashboard } from '@/features/finance/pages/FinanceDashboard';
import { TransactionsPage } from '@/features/finance/pages/TransactionsPage';
import { FinanceBudgets } from '@/features/finance/pages/FinanceBudgets';
import { FinanceRecurring } from '@/features/finance/pages/FinanceRecurring';
import { FinanceAccounts } from '@/features/finance/pages/FinanceAccounts';
import Settings from '@/pages/Settings';

export function SectionRenderer() {
  const section = useUiStore(state => state.section);

  const renderSection = () => {
    switch (section) {
      case 'tasks.home':
        return <TasksHome />;
      case 'finance.dashboard':
        return <FinanceDashboard />;
      case 'finance.transactions':
        return <TransactionsPage />;
      case 'finance.budgets':
        return <FinanceBudgets />;
      case 'finance.recurring':
        return <FinanceRecurring />;
      case 'finance.accounts':
        return <FinanceAccounts />;
      case 'settings':
        return <Settings />;
      default:
        return <TasksHome />;
    }
  };

  return (
    <motion.div
      key={section}
      className="flex-1 h-full"
      data-testid="section-renderer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {renderSection()}
    </motion.div>
  );
}