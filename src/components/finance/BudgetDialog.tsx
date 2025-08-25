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
import { Budget } from '@/features/finance/types';

const budgetSchema = z.object({
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  valorPlanejado: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  mesAno: z.string().min(1, 'Mês/Ano é obrigatório'),
  alertThresholdPct: z.coerce.number().min(1).max(100, 'Deve estar entre 1 e 100'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
  mode?: 'create' | 'edit';
}

export function BudgetDialog({ open, onOpenChange, budget, mode = 'create' }: BudgetDialogProps) {
  const { finance } = useData();
  const { addBudget, updateBudget, categories } = finance;

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoriaId: '',
      valorPlanejado: 0,
      mesAno: new Date().toISOString().slice(0, 7), // YYYY-MM format
      alertThresholdPct: 80,
    },
  });

  // Reset form when budget changes
  useEffect(() => {
    if (budget && mode === 'edit') {
      form.reset({
        categoriaId: budget.categoriaId,
        valorPlanejado: budget.valorPlanejado,
        mesAno: budget.mesAno,
        alertThresholdPct: budget.alertThresholdPct,
      });
    } else {
      form.reset({
        categoriaId: '',
        valorPlanejado: 0,
        mesAno: new Date().toISOString().slice(0, 7),
        alertThresholdPct: 80,
      });
    }
  }, [budget, mode, form]);

  // Only show expense categories for budgets
  const expenseCategories = categories.filter(cat => cat.tipo === 'despesa');

  const onSubmit = async (values: BudgetFormValues) => {
    const budgetData = {
      categoriaId: values.categoriaId,
      valorPlanejado: values.valorPlanejado,
      mesAno: values.mesAno,
      alertThresholdPct: values.alertThresholdPct,
    };

    if (mode === 'edit' && budget) {
      await updateBudget(budget.id, budgetData);
    } else {
      await addBudget(budgetData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nome || 'Categoria não encontrada';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.cor || '#6B7280' }}
                            />
                            {category.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorPlanejado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Planejado</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mesAno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês/Ano</FormLabel>
                  <FormControl>
                    <Input 
                      type="month" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alertThresholdPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alerta quando atingir (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      max="100"
                      placeholder="80" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Salvar' : 'Criar Orçamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}