import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TaskFilters } from './useTasks';

const defaultFilters: TaskFilters = {
  status: 'all',
  tags: [],
  search: '',
};

export function useTaskFilters() {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse filters from URL search params
  const getFiltersFromUrl = useCallback((): TaskFilters => {
    const params = new URLSearchParams(location.search);
    
    return {
      status: (params.get('status') as TaskFilters['status']) || 'all',
      listId: params.get('listId') || undefined,
      priority: (params.get('priority') as TaskFilters['priority']) || undefined,
      tags: params.get('tags') ? params.get('tags')!.split(',') : [],
      dateRange: (params.get('dateRange') as TaskFilters['dateRange']) || undefined,
      search: params.get('search') || '',
    };
  }, [location.search]);

  // Update URL with new filters
  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    const currentFilters = getFiltersFromUrl();
    const updatedFilters = { ...currentFilters, ...newFilters };
    
    const params = new URLSearchParams();
    
    // Only add non-default values to URL
    if (updatedFilters.status !== 'all') {
      params.set('status', updatedFilters.status);
    }
    
    if (updatedFilters.listId) {
      params.set('listId', updatedFilters.listId);
    }
    
    if (updatedFilters.priority) {
      params.set('priority', updatedFilters.priority);
    }
    
    if (updatedFilters.tags.length > 0) {
      params.set('tags', updatedFilters.tags.join(','));
    }
    
    if (updatedFilters.dateRange) {
      params.set('dateRange', updatedFilters.dateRange);
    }
    
    if (updatedFilters.search) {
      params.set('search', updatedFilters.search);
    }

    // Update URL without page reload
    const newUrl = params.toString() ? `/app?${params.toString()}` : '/app';
    navigate(newUrl, { replace: true });
  }, [getFiltersFromUrl, navigate]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    navigate('/app', { replace: true });
  }, [navigate]);

  // Get current filters from URL
  const filters = getFiltersFromUrl();

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}