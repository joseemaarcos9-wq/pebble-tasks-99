import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataExport, ExportOptions } from '../hooks/useDataExport';
import { Download, Calendar as CalendarIcon, FileText, Database } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DataExportDialogProps {
  trigger?: React.ReactNode;
  defaultFields?: string[];
}

export function DataExportDialog({ trigger, defaultFields }: DataExportDialogProps) {
  const { exportData, isExporting, getAvailableFields } = useDataExport();
  const [open, setOpen] = useState(false);
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeFields: defaultFields || ['tasks', 'transactions']
  });
  
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [useDateFilter, setUseDateFilter] = useState(false);
  
  const availableFields = getAvailableFields();
  
  const handleFieldToggle = (fieldValue: string, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      includeFields: checked 
        ? [...prev.includeFields, fieldValue]
        : prev.includeFields.filter(f => f !== fieldValue)
    }));
  };
  
  const handleExport = async () => {
    const exportOptions: ExportOptions = {
      ...options,
      dateRange: useDateFilter && dateRange.start && dateRange.end 
        ? { start: dateRange.start, end: dateRange.end }
        : undefined
    };
    
    await exportData(exportOptions);
    setOpen(false);
  };
  
  const canExport = options.includeFields.length > 0;
  const totalItems = options.includeFields.reduce((total, field) => {
    const fieldData = availableFields.find(f => f.value === field);
    return total + (fieldData?.count || 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Exportar Dados
          </DialogTitle>
          <DialogDescription>
            Selecione os dados que deseja exportar e o formato de saída
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <Select 
              value={options.format} 
              onValueChange={(value: 'csv' | 'json' | 'txt') => 
                setOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-muted-foreground">Estruturado, ideal para backup</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-muted-foreground">Planilhas, Excel</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">TXT</div>
                      <div className="text-xs text-muted-foreground">Texto simples, legível</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          {/* Data Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dados para Exportar</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableFields.map((field) => (
                <Card key={field.value} className="p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={field.value}
                      checked={options.includeFields.includes(field.value)}
                      onCheckedChange={(checked) => 
                        handleFieldToggle(field.value, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={field.value} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {field.label}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {field.count} {field.count === 1 ? 'item' : 'itens'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {availableFields.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum dado disponível para exportação</p>
              </Card>
            )}
          </div>
          
          <Separator />
          
          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dateFilter"
                checked={useDateFilter}
                onCheckedChange={(checked) => setUseDateFilter(checked as boolean)}
              />
              <Label htmlFor="dateFilter" className="text-base font-medium cursor-pointer">
                Filtrar por período
              </Label>
            </div>
            
            {useDateFilter && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? (
                          format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? (
                          format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                        disabled={(date) => 
                          date > new Date() || (dateRange.start && date < dateRange.start)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          {/* Summary */}
          {canExport && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resumo da Exportação</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span>Total de itens:</span>
                  <Badge>{totalItems}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span>Formato:</span>
                  <Badge variant="outline">{options.format.toUpperCase()}</Badge>
                </div>
                {useDateFilter && dateRange.start && dateRange.end && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span>Período:</span>
                    <span className="text-xs">
                      {format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={!canExport || isExporting}
          >
            {isExporting ? (
              'Exportando...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}