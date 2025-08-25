import { Button } from '@/components/ui/button';
import { Settings, Download } from 'lucide-react';
import { useUiStore } from '@/features/ui/store';
import { DataExportDialog } from '@/features/export/components/DataExportDialog';

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
      <DataExportDialog 
        trigger={
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />
      
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