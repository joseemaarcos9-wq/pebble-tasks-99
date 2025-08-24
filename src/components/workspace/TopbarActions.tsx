import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useUiStore } from '@/features/ui/store';

interface TopbarActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCommandOpen: () => void;
  onNewTask?: () => void;
}

export function TopbarActions({ searchValue, onSearchChange, onCommandOpen, onNewTask }: TopbarActionsProps) {
  const { go } = useUiStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => go('settings')}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Configurações
      </Button>
    </div>
  );
}