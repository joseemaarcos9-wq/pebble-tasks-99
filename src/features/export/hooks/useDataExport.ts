import { useState } from 'react';
import { useNotification } from '@/components/providers/NotificationProvider';
import { useData } from '@/components/providers/DataProvider';
import { useAuth } from '@/hooks/useAuth';

export interface ExportOptions {
  format: 'csv' | 'json' | 'txt';
  includeFields: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, string | number | boolean>;
}

export interface ExportableData {
  tasks: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  accounts: Record<string, unknown>[];
  budgets: Record<string, unknown>[];
  recurrences: Record<string, unknown>[];
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useNotification();
  const { tasks, finance } = useData();
  const { user } = useAuth();

  const getAllData = (): ExportableData => {
    return {
      tasks: (tasks?.tasks || []) as unknown as Record<string, unknown>[],
      transactions: (finance?.transactions || []) as unknown as Record<string, unknown>[],
      categories: (finance?.categories || []) as unknown as Record<string, unknown>[],
      accounts: (finance?.accounts || []) as unknown as Record<string, unknown>[],
      budgets: (finance?.budgets || []) as unknown as Record<string, unknown>[],
      recurrences: (finance?.recurrences || []) as unknown as Record<string, unknown>[]
    };
  };

  const filterDataByDateRange = (data: Record<string, unknown>[], dateRange?: { start: Date; end: Date }) => {
    if (!dateRange) return data;
    
    return data.filter(item => {
      const itemDate = new Date((item.created_at || item.data || item.due_date) as string);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  };

  const formatDataForExport = (data: ExportableData, options: ExportOptions) => {
    const { includeFields, dateRange } = options;
    const result: Record<string, Record<string, unknown>[]> = {};

    // Filter and format each data type
    Object.entries(data).forEach(([key, items]) => {
      if (includeFields.includes(key)) {
        const filteredItems = filterDataByDateRange(items, dateRange);
        result[key] = filteredItems.map(item => {
          // Remove sensitive fields
          const { user_id, ...cleanItem } = item;
          return cleanItem;
        });
      }
    });

    return result;
  };

  const generateCSV = (data: Record<string, Record<string, unknown>[]>): string => {
    let csv = '';
    
    Object.entries(data).forEach(([tableName, items]) => {
      if (items.length === 0) return;
      
      csv += `\n\n=== ${tableName.toUpperCase()} ===\n`;
      
      // Headers
      const headers = Object.keys(items[0]);
      csv += headers.join(',') + '\n';
      
      // Data rows
      items.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        });
        csv += row.join(',') + '\n';
      });
    });
    
    return csv;
  };

  const generateJSON = (data: Record<string, Record<string, unknown>[]>): string => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email,
      version: '1.0',
      data
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const generateTXT = (data: Record<string, Record<string, unknown>[]>): string => {
    let txt = `PEBBLE TASKS - EXPORTAÇÃO DE DADOS\n`;
    txt += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
    txt += `Usuário: ${user?.email}\n`;
    txt += `${'='.repeat(50)}\n\n`;
    
    Object.entries(data).forEach(([tableName, items]) => {
      txt += `${tableName.toUpperCase()}\n`;
      txt += `${'-'.repeat(tableName.length)}\n`;
      
      if (items.length === 0) {
        txt += 'Nenhum item encontrado\n\n';
        return;
      }
      
      items.forEach((item, index) => {
        txt += `${index + 1}. `;
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            txt += `${key}: ${value} | `;
          }
        });
        txt += '\n';
      });
      
      txt += '\n';
    });
    
    return txt;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
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

  const exportData = async (options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      const allData = getAllData();
      const formattedData = formatDataForExport(allData, options);
      
      // Check if there's data to export
      const hasData = Object.values(formattedData).some(items => items.length > 0);
      if (!hasData) {
        error('Nenhum dado encontrado', 'Não há dados para exportar com os filtros selecionados');
        return;
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      let content: string;
      let filename: string;
      let mimeType: string;
      
      switch (options.format) {
        case 'csv':
          content = generateCSV(formattedData);
          filename = `pebble-tasks-export-${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;
        case 'json':
          content = generateJSON(formattedData);
          filename = `pebble-tasks-export-${timestamp}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;
        case 'txt':
          content = generateTXT(formattedData);
          filename = `pebble-tasks-export-${timestamp}.txt`;
          mimeType = 'text/plain;charset=utf-8;';
          break;
        default:
          throw new Error('Formato não suportado');
      }
      
      downloadFile(content, filename, mimeType);
      
      const itemCount = Object.values(formattedData).reduce((total, items) => total + items.length, 0);
      success(
        'Exportação concluída', 
        `${itemCount} itens exportados em formato ${options.format.toUpperCase()}`
      );
      
    } catch (err) {
      console.error('Export error:', err);
      error('Erro na exportação', 'Não foi possível exportar os dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const getAvailableFields = (): { value: string; label: string; count: number }[] => {
    const allData = getAllData();
    
    return [
      { value: 'tasks', label: 'Tarefas', count: allData.tasks.length },
      { value: 'transactions', label: 'Transações', count: allData.transactions.length },
      { value: 'categories', label: 'Categorias', count: allData.categories.length },
      { value: 'accounts', label: 'Contas', count: allData.accounts.length },
      { value: 'budgets', label: 'Orçamentos', count: allData.budgets.length },
      { value: 'recurrences', label: 'Recorrências', count: allData.recurrences.length }
    ].filter(field => field.count > 0);
  };

  return {
    exportData,
    isExporting,
    getAvailableFields
  };
}