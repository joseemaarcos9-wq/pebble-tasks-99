import { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Repeat, 
  Wallet,
  Settings as SettingsIcon,
  Plus,
  Filter
} from 'lucide-react';
import { useUiStore, Section } from '@/features/ui/store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CommandItem {
  section: Section;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords: string[];
}

const commands: CommandItem[] = [
  {
    section: 'tasks.home',
    title: 'Ir para Tarefas',
    description: 'Gerenciar suas tarefas e projetos',
    icon: CheckSquare,
    group: 'Navegação',
    keywords: ['tarefas', 'tasks', 'todo', 'gt']
  },
  {
    section: 'finance.dashboard',
    title: 'Ir para Financeiro',
    description: 'Visão geral das suas finanças',
    icon: BarChart3,
    group: 'Navegação',
    keywords: ['dashboard', 'financeiro', 'resumo', 'gfd']
  },
  {
    section: 'finance.transactions',
    title: 'Transações',
    description: 'Gerenciar receitas e despesas',
    icon: DollarSign,
    group: 'Financeiro',
    keywords: ['transações', 'despesas', 'receitas', 'gft']
  },
  {
    section: 'finance.budgets',
    title: 'Orçamentos',
    description: 'Planejar gastos por categoria',
    icon: CreditCard,
    group: 'Financeiro',
    keywords: ['orçamentos', 'budget', 'planejamento']
  },
  {
    section: 'finance.recurring',
    title: 'Recorrências',
    description: 'Transações automáticas',
    icon: Repeat,
    group: 'Financeiro',
    keywords: ['recorrências', 'automático', 'repeat']
  },
  {
    section: 'finance.accounts',
    title: 'Contas',
    description: 'Gerenciar contas bancárias',
    icon: Wallet,
    group: 'Financeiro',
    keywords: ['contas', 'bancos', 'accounts']
  },
  {
    section: 'settings',
    title: 'Configurações',
    description: 'Preferências do sistema',
    icon: SettingsIcon,
    group: 'Sistema',
    keywords: ['configurações', 'settings', 'preferências']
  }
];

// Action commands for future expansion
interface ActionCommand {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords: string[];
  action?: () => void;
}

const actionCommands: ActionCommand[] = [
  {
    title: 'Criar Nova Tarefa',
    description: 'Adicionar uma nova tarefa',
    icon: Plus,
    group: 'Ações',
    keywords: ['criar', 'nova', 'tarefa', 'add', 'n'],
    action: () => {
      const event = new CustomEvent('new-task-shortcut');
      window.dispatchEvent(event);
    }
  },
  {
    title: 'Abrir Filtros',
    description: 'Mostrar opções de filtro',
    icon: Filter,
    group: 'Ações', 
    keywords: ['filtros', 'filter', 'buscar']
  }
];

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const { go } = useUiStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = (section?: Section, action?: () => void) => {
    if (action) {
      action();
    } else if (section) {
      go(section);
    }
    onOpenChange(false);
  };

  const filteredCommands = commands.filter(command => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  const filteredActions = actionCommands.filter(command => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  const allCommands = [...filteredCommands, ...filteredActions];

  const groupedCommands = allCommands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = [];
    }
    acc[command.group].push(command);
    return acc;
  }, {} as Record<string, (CommandItem | ActionCommand)[]>);

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange}
      data-testid="command-menu"
    >
      <CommandInput 
        placeholder="Digite um comando..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem
                key={'section' in item ? item.section : item.title}
                onSelect={() => handleSelect('section' in item ? item.section : undefined, 'action' in item ? item.action : undefined)}
                className="flex items-center gap-3 p-3"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}