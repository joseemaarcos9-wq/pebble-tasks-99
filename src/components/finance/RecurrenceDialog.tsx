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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/components/providers/DataProvider';
import { Recurrence, RecurrenceFrequency } from '@/features/finance/types';

const recurrenceSchema = z.object({
  tipo: z.enum(['despesa', 'receita'] as const),
  frequencia: z.enum(['mensal', 'semanal', 'anual', 'custom'] as const),
  diaBase: z.coerce.number().min(1).max(31),
  proximaOcorrencia: z.string().min(1, 'Data da próxima ocorrência é obrigatória'),
  contaId: z.string().min(1, 'Conta é obrigatória'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  categoriaId: z.string().optional(),
  descricao: z.string().optional(),
  tags: z.string().optional(),
  ativo: z.boolean(),
});

type RecurrenceFormValues = z.infer<typeof recurrenceSchema>;

interface RecurrenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurrence?: Recurrence;
  mode?: 'create' | 'edit';
}

const frequencyOptions: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
  { value: 'custom', label: 'Personalizado' },
];

export function RecurrenceDialog({ open, onOpenChange, recurrence, mode = 'create' }: RecurrenceDialogProps) {
  const { finance } = useData();
  const { addRecurrence, updateRecurrence, accounts, categories } = finance;

  const form = useForm<RecurrenceFormValues>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: {
      tipo: 'despesa',
      frequencia: 'mensal',
      diaBase: new Date().getDate(),
      proximaOcorrencia: new Date().toISOString().split('T')[0],
      contaId: '',
      valor: 0,
      categoriaId: '',
      descricao: '',
      tags: '',
      ativo: true,
    },
  });

  // Reset form when recurrence changes
  useEffect(() => {
    if (recurrence && mode === 'edit') {
      form.reset({
        tipo: recurrence.tipo,
        frequencia: recurrence.frequencia,
        diaBase: recurrence.diaBase,
        proximaOcorrencia: recurrence.proximaOcorrencia.split('T')[0],
        contaId: recurrence.contaId,
        valor: recurrence.valor,
        categoriaId: recurrence.categoriaId || '',
        descricao: recurrence.descricao || '',
        tags: recurrence.tags || '',
        ativo: recurrence.ativo,
      });
    } else {
      form.reset({
        tipo: 'despesa',
        frequencia: 'mensal',
        diaBase: new Date().getDate(),
        proximaOcorrencia: new Date().toISOString().split('T')[0],
        contaId: '',
        valor: 0,
        categoriaId: '',
        descricao: '',
        tags: '',
        ativo: true,
      });
    }
  }, [recurrence, mode, form]);

  const selectedType = form.watch('tipo');
  const availableCategories = categories.filter(cat => cat.tipo === selectedType);

  const onSubmit = async (values: RecurrenceFormValues) => {
    const recurrenceData = {
      tipo: values.tipo,
      frequencia: values.frequencia,
      diaBase: values.diaBase,
      proximaOcorrencia: values.proximaOcorrencia,
      contaId: values.contaId,
      valor: values.valor,
      categoriaId: values.categoriaId || undefined,
      descricao: values.descricao || undefined,
      tags: values.tags || '',
      ativo: values.ativo,
    };

    if (mode === 'edit' && recurrence) {
      await updateRecurrence(recurrence.id, recurrenceData);
    } else {
      await addRecurrence(recurrenceData);
    }

    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.nome || 'Conta não encontrada';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nome || 'Categoria não encontrada';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Recorrência' : 'Nova Recorrência'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="receita">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="contaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.nome}
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
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (Opcional)</FormLabel>
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
                      <SelectItem value="">Nenhuma</SelectItem>
                      {availableCategories.map((category) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="diaBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Base</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="31"
                        placeholder="1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="proximaOcorrencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Ocorrência</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição da transação recorrente..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="tag1, tag2, tag3" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Gerar automaticamente as próximas transações
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {mode === 'edit' ? 'Salvar' : 'Criar Recorrência'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}