import { useState } from 'react';
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
import { useData } from '@/components/providers/DataProvider';

const recurrenceSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  conta_id: z.string().min(1, 'Conta é obrigatória'),
  categoria_id: z.string().optional(),
});

type RecurrenceFormValues = z.infer<typeof recurrenceSchema>;

interface RecurrenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurrenceDialog({ open, onOpenChange }: RecurrenceDialogProps) {
  const { finance } = useData();
  const { addRecurrence, accounts, categories } = finance;

  const form = useForm<RecurrenceFormValues>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: {
      description: '',
      valor: 0,
      conta_id: '',
      categoria_id: '',
    },
  });

  const onSubmit = async (values: RecurrenceFormValues) => {
    await addRecurrence({
      ...values,
      tipo: 'despesa' as const,
      frequencia: 'mensal' as const,
      dia_base: new Date().getDate(),
      proxima_ocorrencia: new Date().toISOString().split('T')[0],
      ativo: true,
      tags: '',
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Recorrência</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel, Internet..." {...field} />
                  </FormControl>
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
                    <Input type="number" step="0.01" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Recorrência</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}