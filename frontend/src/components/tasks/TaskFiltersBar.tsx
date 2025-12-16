import { useState } from 'react';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskFilters, TaskSort, TaskPriority, TaskStatus } from '@/types/database';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  sort: TaskSort;
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (sort: TaskSort) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'due_date-asc', label: 'Due Date (Earliest)' },
  { value: 'due_date-desc', label: 'Due Date (Latest)' },
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'priority-desc', label: 'Priority (Highest)' },
  { value: 'priority-asc', label: 'Priority (Lowest)' },
];

/**
 * Filters and sorting bar for task list
 */
export function TaskFiltersBar({ filters, sort, onFiltersChange, onSortChange }: TaskFiltersBarProps) {
  const activeFiltersCount = 
    (filters.status?.length || 0) + 
    (filters.priority?.length || 0);

  const handleStatusToggle = (status: TaskStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated.length > 0 ? updated : undefined });
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priority: updated.length > 0 ? updated : undefined });
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [TaskSort['field'], TaskSort['direction']];
    onSortChange({ field, direction });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Priority</h4>
              <div className="space-y-2">
                {PRIORITY_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priority?.includes(option.value) || false}
                      onCheckedChange={() => handlePriorityToggle(option.value)}
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Select */}
      <Select value={`${sort.field}-${sort.direction}`} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
