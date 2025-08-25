import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { 
  Search, 
  X, 
  Filter, 
  Calendar,
  Tag,
  User,
  Hash,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

export interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'select' | 'tag';
  options?: { label: string; value: string }[];
}

export interface AdvancedSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFiltersChange?: (filters: SearchFilter[]) => void;
  availableFilters?: Omit<SearchFilter, 'value'>[];
  activeFilters?: SearchFilter[];
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
  showFilters?: boolean;
}

export function AdvancedSearch({
  placeholder = 'Pesquisar...',
  value = '',
  onChange,
  onFiltersChange,
  availableFilters = [],
  activeFilters = [],
  suggestions = [],
  recentSearches = [],
  className,
  showFilters = true
}: AdvancedSearchProps) {
  const [searchValue, setSearchValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue);
    onChange?.(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    onChange?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const addFilter = (filter: Omit<SearchFilter, 'value'>) => {
    const newFilter: SearchFilter = {
      ...filter,
      value: ''
    };
    onFiltersChange?.([...activeFilters, newFilter]);
    setShowFilterMenu(false);
  };

  const updateFilter = (filterId: string, value: string) => {
    const updatedFilters = activeFilters.map(filter =>
      filter.id === filterId ? { ...filter, value } : filter
    );
    onFiltersChange?.(updatedFilters);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter(filter => filter.id !== filterId);
    onFiltersChange?.(updatedFilters);
  };

  const clearAll = () => {
    setSearchValue('');
    onChange?.('');
    onFiltersChange?.([]);
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase()) &&
    suggestion.toLowerCase() !== searchValue.toLowerCase()
  ).slice(0, 5);

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'date': return <Calendar className="h-3 w-3" />;
      case 'tag': return <Tag className="h-3 w-3" />;
      case 'select': return <Hash className="h-3 w-3" />;
      default: return <Filter className="h-3 w-3" />;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(searchValue.length > 0)}
          className="pl-10 pr-20"
          data-search-input
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showFilters && (
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Adicionar Filtro</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => addFilter(filter)}
                    disabled={activeFilters.some(f => f.id === filter.id)}
                  >
                    {getFilterIcon(filter.type)}
                    <span className="ml-2">{filter.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {(searchValue || activeFilters.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter) => (
            <FilterBadge
              key={filter.id}
              filter={filter}
              onUpdate={(value) => updateFilter(filter.id, value)}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-2">
            {filteredSuggestions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Sugestões
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {recentSearches.length > 0 && searchValue === '' && (
              <div>
                {filteredSuggestions.length > 0 && <div className="border-t my-1" />}
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Pesquisas Recentes
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Filter Badge Component
interface FilterBadgeProps {
  filter: SearchFilter;
  onUpdate: (value: string) => void;
  onRemove: () => void;
}

function FilterBadge({ filter, onUpdate, onRemove }: FilterBadgeProps) {
  const [isEditing, setIsEditing] = useState(!filter.value);

  const handleSubmit = (value: string) => {
    onUpdate(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger asChild>
          <Badge variant="outline" className="cursor-pointer">
            {filter.label}: {filter.value || 'definir'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          {filter.type === 'select' && filter.options ? (
            <div className="space-y-1">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSubmit(option.value)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <Input
              type={filter.type === 'date' ? 'date' : 'text'}
              placeholder={`Digite ${filter.label.toLowerCase()}...`}
              value={filter.value}
              onChange={(e) => onUpdate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                }
              }}
              autoFocus
            />
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      {filter.label}: {filter.value}
      <button
        onClick={() => setIsEditing(true)}
        className="hover:bg-muted-foreground/20 rounded p-0.5"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
      <button
        onClick={onRemove}
        className="hover:bg-muted-foreground/20 rounded p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}