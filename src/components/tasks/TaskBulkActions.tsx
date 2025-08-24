import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckSquare,
  Square,
  Archive,
  Trash2,
  Tag,
  FolderOpen,
  MoreVertical,
  X,
  AlertTriangle
} from 'lucide-react';
import { useTaskActions } from '@/store/hooks/useTaskActions';
import { Priority } from '@/store/types';

interface TaskBulkActionsProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
}

export function TaskBulkActions({ selectedTaskIds, onClearSelection }: TaskBulkActionsProps) {
  const { bulkUpdateTasks, archiveTasks, tasks, lists } = useTaskActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetListId, setTargetListId] = useState<string>('');

  if (selectedTaskIds.length === 0) return null;

  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
  const allCompleted = selectedTasks.every(task => task.status === 'concluida');
  const allPending = selectedTasks.every(task => task.status === 'pendente');

  const handleMarkComplete = () => {
    bulkUpdateTasks(selectedTaskIds, { status: 'concluida', completedAt: new Date() });
    onClearSelection();
  };

  const handleMarkPending = () => {
    bulkUpdateTasks(selectedTaskIds, { status: 'pendente', completedAt: undefined });
    onClearSelection();
  };

  const handleSetPriority = (priority: Priority) => {
    bulkUpdateTasks(selectedTaskIds, { priority });
    onClearSelection();
  };

  const handleArchive = () => {
    archiveTasks(selectedTaskIds);
    onClearSelection();
  };

  const handleDelete = () => {
    selectedTaskIds.forEach(id => {
      const deleteTask = useTaskActions().deleteTask;
      deleteTask(id);
    });
    onClearSelection();
    setShowDeleteDialog(false);
  };

  const handleMove = () => {
    if (targetListId) {
      bulkUpdateTasks(selectedTaskIds, { listId: targetListId });
      onClearSelection();
      setShowMoveDialog(false);
      setTargetListId('');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4">
          {/* Selection counter */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedTaskIds.length} selecionada{selectedTaskIds.length > 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {!allCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkComplete}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Concluir
              </Button>
            )}

            {!allPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkPending}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Reabrir
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Arquivar
            </Button>

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Priority submenu */}
                <DropdownMenuItem
                  onSelect={() => handleSetPriority('baixa')}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4 text-blue-500" />
                  Prioridade: Baixa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleSetPriority('media')}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4 text-yellow-500" />
                  Prioridade: Média
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleSetPriority('alta')}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4 text-orange-500" />
                  Prioridade: Alta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleSetPriority('urgente')}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4 text-red-500" />
                  Prioridade: Urgente
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => setShowMoveDialog(true)}
                  className="gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Mover para lista
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => setShowDeleteDialog(true)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir todas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedTaskIds.length} tarefa{selectedTaskIds.length > 1 ? 's' : ''}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir {selectedTaskIds.length} tarefa{selectedTaskIds.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to list dialog */}
      <AlertDialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover tarefas</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione a lista de destino para {selectedTaskIds.length} tarefa{selectedTaskIds.length > 1 ? 's' : ''}:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={targetListId} onValueChange={setTargetListId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lista" />
              </SelectTrigger>
              <SelectContent>
                {lists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: list.color || '#6b7280' }}
                      />
                      {list.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTargetListId('')}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMove} disabled={!targetListId}>
              Mover tarefas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}