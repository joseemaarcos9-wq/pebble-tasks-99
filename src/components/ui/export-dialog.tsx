import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { Loading } from './loading';

export interface ExportField {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  extension: string;
}

export interface ExportOptions {
  format: string;
  fields: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, string | number | boolean>;
}

export interface ExportDialogProps {
  title?: string;
  description?: string;
  data: Record<string, unknown>[];
  fields: ExportField[];
  formats?: ExportFormat[];
  onExport: (options: ExportOptions) => Promise<void>;
  trigger?: React.ReactNode;
  className?: string;
}

const defaultFormats: ExportFormat[] = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Arquivo de valores separados por vírgula',
    icon: FileSpreadsheet,
    extension: '.csv'
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Formato de dados JavaScript',
    icon: FileJson,
    extension: '.json'
  },
  {
    id: 'txt',
    label: 'TXT',
    description: 'Arquivo de texto simples',
    icon: FileText,
    extension: '.txt'
  }
];

export function ExportDialog({
  title = 'Exportar Dados',
  description = 'Escolha o formato e os campos que deseja exportar.',
  data,
  fields,
  formats = defaultFormats,
  onExport,
  trigger,
  className
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(formats[0]?.id || 'csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    fields.filter(f => f.required).map(f => f.id)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleFieldToggle = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field?.required) return; // Can't uncheck required fields

    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(fields.map(f => f.id));
  };

  const handleSelectNone = () => {
    setSelectedFields(fields.filter(f => f.required).map(f => f.id));
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) return;

    setIsExporting(true);
    setExportComplete(false);

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        fields: selectedFields
      };

      await onExport(options);
      setExportComplete(true);
      
      // Auto close after success
      setTimeout(() => {
        setOpen(false);
        setExportComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormat_obj = formats.find(f => f.id === selectedFormat);
  const canExport = selectedFields.length > 0 && data.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="py-8">
            <Loading 
              size="lg" 
              text="Preparando exportação..." 
              className="text-center"
            />
          </div>
        ) : exportComplete ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Exportação Concluída!</h3>
            <p className="text-muted-foreground">
              Seus dados foram exportados com sucesso.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Data Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resumo dos Dados</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{data.length} registros</span>
                  <span>•</span>
                  <span>{selectedFields.length} campos selecionados</span>
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Formato de Exportação</Label>
              <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
                <div className="grid grid-cols-1 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div key={format.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={format.id} id={format.id} />
                        <Label 
                          htmlFor={format.id} 
                          className="flex items-center gap-3 flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{format.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {format.description}
                            </div>
                          </div>
                          <Badge variant="outline">{format.extension}</Badge>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Campos para Exportar</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Selecionar Todos
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectNone}
                    className="text-xs"
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {fields.map((field) => {
                  const isSelected = selectedFields.includes(field.id);
                  const isRequired = field.required;
                  
                  return (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={isSelected}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                        disabled={isRequired}
                      />
                      <Label 
                        htmlFor={field.id} 
                        className={cn(
                          'flex-1 cursor-pointer text-sm',
                          isRequired && 'font-medium'
                        )}
                      >
                        {field.label}
                        {isRequired && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Obrigatório
                          </Badge>
                        )}
                        {field.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {field.description}
                          </div>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isExporting && !exportComplete && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={!canExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar {selectedFormat_obj?.label}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Utility functions for different export formats
export const exportUtils = {
  csv: (data: Record<string, unknown>[], fields: string[]) => {
    const headers = fields.join(',');
    const rows = data.map(item => 
      fields.map(field => {
        const value = item[field];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  },

  json: (data: Record<string, unknown>[], fields: string[]) => {
    const filteredData = data.map(item => {
      const filtered: Record<string, unknown> = {};
      fields.forEach(field => {
        filtered[field] = item[field];
      });
      return filtered;
    });
    return JSON.stringify(filteredData, null, 2);
  },

  txt: (data: Record<string, unknown>[], fields: string[]) => {
    const lines = data.map(item => 
      fields.map(field => `${field}: ${item[field] || ''}`).join(' | ')
    );
    return lines.join('\n');
  }
};

// Helper function to download file
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};