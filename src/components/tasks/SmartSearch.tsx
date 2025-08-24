import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Search, 
  Hash, 
  List, 
  AlertCircle, 
  Calendar,
  X,
  Filter,
  Sparkles
} from 'lucide-react';
import { useTaskFilters } from '@/store/hooks/useTaskFilters';
import { cn } from '@/lib/utils';

interface SmartSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ 
  value, 
  onChange, 
  placeholder = "Buscar tarefas...",
  className 
}: SmartSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getFilterSuggestions, buildSmartFilter, setFilters, clearFilters } = useTaskFilters();

  const suggestions = getFilterSuggestions(searchInput);

  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== value) {
        onChange(searchInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, value, onChange]);

  const handleInputChange = (newValue: string) => {
    setSearchInput(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSuggestionSelect = (suggestion: { type: string; value: string; display: string }) => {
    let newValue = searchInput;
    
    switch (suggestion.type) {
      case 'tag':
        newValue = `${searchInput} #${suggestion.value}`.trim();
        break;
      case 'list':
        newValue = `${searchInput} lista:${suggestion.value}`.trim();
        break;
      case 'priority':
        newValue = `${searchInput} prioridade:${suggestion.value}`.trim();
        break;
      default:
        newValue = suggestion.value;
    }
    
    setSearchInput(newValue);
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSmartFilter = () => {
    const filters = buildSmartFilter(searchInput);
    setFilters(filters);
    setOpen(false);
  };

  const parseSearchTerms = (search: string) => {
    const terms = [];
    const words = search.split(' ');
    
    for (const word of words) {
      if (word.startsWith('#')) {
        terms.push({ type: 'tag', value: word.substring(1), display: word });
      } else if (word.startsWith('lista:')) {
        terms.push({ type: 'list', value: word.substring(6), display: word });
      } else if (word.startsWith('prioridade:')) {
        terms.push({ type: 'priority', value: word.substring(11), display: word });
      } else if (['hoje', 'atrasadas', 'semana'].includes(word)) {
        terms.push({ type: 'date', value: word, display: word });
      } else if (['pendentes', 'concluidas'].includes(word)) {
        terms.push({ type: 'status', value: word, display: word });
      } else if (word.trim()) {
        terms.push({ type: 'text', value: word, display: word });
      }
    }
    
    return terms;
  };

  const terms = parseSearchTerms(searchInput);

  const handleRemoveTerm = (termToRemove: { type: string; value: string; display: string }) => {
    let newValue = searchInput;
    
    if (termToRemove.type === 'tag') {
      newValue = newValue.replace(`#${termToRemove.value}`, '').trim();
    } else if (termToRemove.type === 'list') {
      newValue = newValue.replace(`lista:${termToRemove.value}`, '').trim();
    } else if (termToRemove.type === 'priority') {
      newValue = newValue.replace(`prioridade:${termToRemove.value}`, '').trim();
    } else {
      newValue = newValue.replace(termToRemove.display, '').trim();
    }
    
    // Clean up extra spaces
    newValue = newValue.replace(/\s+/g, ' ').trim();
    
    setSearchInput(newValue);
    onChange(newValue);
  };

  const getTermIcon = (type: string) => {
    switch (type) {
      case 'tag': return Hash;
      case 'list': return List;
      case 'priority': return AlertCircle;
      case 'date': return Calendar;
      default: return Search;
    }
  };

  const getTermColor = (type: string) => {
    switch (type) {
      case 'tag': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'list': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'priority': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'date': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'status': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              ref={inputRef}
              value={searchInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10"
              data-search-input
              onFocus={() => setShowSuggestions(searchInput.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </PopoverTrigger>
          
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                onChange('');
                clearFilters();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {(showSuggestions || open) && suggestions.length > 0 && (
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>Nenhuma sugestão encontrada.</CommandEmpty>
                  <CommandGroup heading="Sugestões">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <CommandItem 
                        key={index}
                        onSelect={() => handleSuggestionSelect(suggestion)}
                        className="gap-2"
                      >
                        {suggestion.type === 'tag' && <Hash className="h-4 w-4" />}
                        {suggestion.type === 'list' && <List className="h-4 w-4" />}
                        {suggestion.type === 'priority' && <AlertCircle className="h-4 w-4" />}
                        {suggestion.display}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  
                  {searchInput && (
                    <>
                      <Separator />
                      <CommandGroup>
                        <CommandItem onSelect={handleSmartFilter} className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Aplicar filtro inteligente
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>

      {/* Search terms display */}
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {terms.map((term, index) => {
            const Icon = getTermIcon(term.type);
            return (
              <Badge
                key={index}
                variant="secondary"
                className={cn("gap-1 text-xs", getTermColor(term.type))}
              >
                <Icon className="h-3 w-3" />
                {term.display}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTerm(term)}
                  className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Quick filter examples */}
      {searchInput === '' && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Exemplos: <code>#trabalho</code>, <code>prioridade:alta</code>, <code>hoje</code>, <code>lista:pessoal</code></p>
        </div>
      )}
    </div>
  );
}