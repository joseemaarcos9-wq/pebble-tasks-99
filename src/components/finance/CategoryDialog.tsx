import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/components/providers/DataProvider';
import { Category, CategoryType } from '@/features/finance/types';

const categorySchema = z.object({
  nome: z.string().min(1, 'Nome da categoria é obrigatório'),
  tipo: z.enum(['despesa', 'receita'] as const),
  parentId: z.string().optional(),
  cor: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  mode?: 'create' | 'edit';
}

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: 'despesa', label: 'Despesa' },
  { value: 'receita', label: 'Receita' },
];

const categoryColors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#64748B', '#6B7280', '#374151'
];

export function CategoryDialog({ open, onOpenChange, category, mode = 'create' }: CategoryDialogProps) {
  const { finance } = useData();
  const { addCategory, categories } = finance;
  const [selectedColor, setSelectedColor] = useState(categoryColors[0]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: '',
      tipo: 'despesa',
      parentId: undefined,
      cor: categoryColors[0],
    },
  });

  // Reset form when category changes
  useEffect(() => {
    if (category && mode === 'edit') {
      form.reset({
        nome: category.nome,
        tipo: category.tipo,
        parentId: category.parentId,
        cor: category.cor || categoryColors[0],
      });
      setSelectedColor(category.cor || categoryColors[0]);
    } else {
      form.reset({
        nome: '',
        tipo: 'despesa',
        parentId: undefined,
        cor: categoryColors[0],
      });
      setSelectedColor(categoryColors[0]);
    }
  }, [category, mode, form]);

  const selectedType = form.watch('tipo');
  const parentCategories = categories.filter(cat => 
    cat.tipo === selectedType && !cat.parent_id && cat.id !== category?.id
  );

  const onSubmit = async (values: CategoryFormValues) => {
    // Since updateCategory doesn't exist, we'll just use addCategory for now
    // TODO: Add updateCategory method to useFinance hook
    if (mode === 'edit' && category) {
      console.warn('Category update functionality not implemented yet');
      return;
    }

    const categoryData = {
      nome: values.nome,
      tipo: values.tipo,
      parent_id: values.parentId || null,
      cor: selectedColor,
    };

    await addCategory(categoryData);

    form.reset();
    setSelectedColor(categoryColors[0]);
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    setSelectedColor(categoryColors[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Alimentação, Salário..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {parentCategories.length > 0 && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria Pai (Opcional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria pai" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Cor</FormLabel>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Salvar' : 'Criar Categoria'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}