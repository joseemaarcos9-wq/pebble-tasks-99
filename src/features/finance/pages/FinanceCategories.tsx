import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/components/providers/DataProvider';
import { CategoryDialog } from '@/components/finance/CategoryDialog';
import { Category } from '@/features/finance/types';
import { Plus, MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FinanceCategories() {
  const { finance: { categories, loading } } = useData();
  const { toast } = useToast();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setDialogMode('create');
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogMode('edit');
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.nome}"?`)) {
      toast({
        title: "Funcionalidade não implementada",
        description: "A exclusão de categorias será implementada em breve.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsCategoryDialogOpen(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter(cat => cat.tipo === 'despesa');
  const incomeCategories = categories.filter(cat => cat.tipo === 'receita');
  const parentCategories = categories.filter(cat => !cat.parent_id);
  const childCategories = categories.filter(cat => cat.parent_id);

  const getCategoryChildren = (parentId: string) => {
    return childCategories.filter(cat => cat.parent_id === parentId);
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    const children = getCategoryChildren(category.id);
    const Icon = category.tipo === 'receita' ? TrendingUp : TrendingDown;
    
    return (
      <Card key={category.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: category.cor || '#6B7280' }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{category.nome}</h3>
                  <Icon className={`h-4 w-4 ${
                    category.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                  }`} />
                </div>
                {children.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {children.length} subcategoria{children.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={category.tipo === 'receita' ? 'default' : 'secondary'}>
                {category.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteCategory(category)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Subcategorias */}
          {children.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-border space-y-2">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: child.cor || '#6B7280' }}
                    />
                    <span className="text-sm">{child.nome}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCategory(child as any)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCategory(child as any)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Categorias</h1>
          <p className="text-muted-foreground">Organize suas receitas e despesas</p>
        </div>
        <Button onClick={handleCreateCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {expenseCategories.length} despesas, {incomeCategories.length} receitas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Com {childCategories.length} subcategorias
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Usadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as Categorias</h2>
        
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
              <Button onClick={handleCreateCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {parentCategories.map((category) => (
              <CategoryCard key={category.id} category={category as any} />
            ))}
          </div>
        )}
      </div>

      <CategoryDialog 
        open={isCategoryDialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
        mode={dialogMode}
      />
    </div>
  );
}