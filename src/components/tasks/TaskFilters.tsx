import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar,
  Tag,
  List,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useData } from '@/components/providers/DataProvider';
import { TaskFilters as TaskFiltersType } from '@/hooks/useTasks';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
  onClearFilters: () => void;
}

export function TaskFilters({ filters, onFiltersChange, onClearFilters }: TaskFiltersProps) {
  const { tasks: { lists, getAllTags } } = useData();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const allTags = getAllTags();
  
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    onFiltersChange({ status });
  };

  const handleListChange = (listId: string) => {
    onFiltersChange({ listId: listId === 'all' ? undefined : listId });
  };

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({ 
      priority: priority === 'all' ? undefined : priority as 'baixa' | 'media' | 'alta' | 'urgente'
    });
  };

  const handleDateRangeChange = (dateRange: string) => {
    onFiltersChange({ 
      dateRange: dateRange === 'all' ? undefined : dateRange as 'today' | 'week' | 'overdue'
    });
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    const currentTags = filters.tags;
    if (checked) {
      onFiltersChange({ tags: [...currentTags, tag] });
    } else {
      onFiltersChange({ tags: currentTags.filter(t => t !== tag) });
    }
  };

  const addCustomTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      onFiltersChange({ tags: [...filters.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onFiltersChange({ tags: filters.tags.filter(t => t !== tag) });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status !== 'all' ||
    filters.listId ||
    filters.priority ||
    filters.dateRange ||
    filters.tags.length > 0;

  const getTaskCounts = () => {
    // Esta função seria implementada para mostrar contadores
    // Por enquanto, retornamos valores mock
    return {
      all: 25,
      pending: 18,
      completed: 7,
      overdue: 3,
    };
  };

  const counts = getTaskCounts();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros Rápidos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.status === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('all')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Todas ({counts.all})
            </Button>
            <Button
              variant={filters.status === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('pending')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pendentes ({counts.pending})
            </Button>
            <Button
              variant={filters.status === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('completed')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Concluídas ({counts.completed})
            </Button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">Filtros Avançados</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Lista */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lista</Label>
              <Select 
                value={filters.listId || 'all'} 
                onValueChange={handleListChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as listas</SelectItem>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        {list.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: list.color }}
                          />
                        )}
                        {list.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prioridade</Label>
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="urgente">
                    <Badge className="bg-red-100 text-red-800 border-red-200">Urgente</Badge>
                  </SelectItem>
                  <SelectItem value="alta">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alta</Badge>
                  </SelectItem>
                  <SelectItem value="media">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Média</Badge>
                  </SelectItem>
                  <SelectItem value="baixa">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Baixa</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </Label>
              <Select 
                value={filters.dateRange || 'all'} 
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Atrasadas ({counts.overdue})
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              
              {/* Tags Selecionadas */}
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tags Disponíveis */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tags disponíveis:</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags
                      .filter(tag => !filters.tags.includes(tag))
                      .slice(0, 10) // Limita a 10 tags para não sobrecarregar
                      .map((tag) => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTagToggle(tag, true)}
                          className="h-7 text-xs"
                        >
                          {tag}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Adicionar Tag Personalizada */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  className="text-sm"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCustomTag}
                  disabled={!newTag.trim()}
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Indicador de Filtros Ativos */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filtros ativos</span>
              <Badge variant="secondary" className="text-xs">
                {[
                  filters.search && 'busca',
                  filters.status !== 'all' && 'status',
                  filters.listId && 'lista',
                  filters.priority && 'prioridade',
                  filters.dateRange && 'período',
                  filters.tags.length > 0 && `${filters.tags.length} tag${filters.tags.length > 1 ? 's' : ''}`
                ].filter(Boolean).join(', ')}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}