import { cn } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/types/database';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  urgent: { label: 'Urgent', className: 'priority-urgent' },
};

/**
 * Badge component for displaying task priority
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border', config.className, className)}>
      {config.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  review: { label: 'Review', className: 'status-review' },
  completed: { label: 'Completed', className: 'status-completed' },
};

/**
 * Badge component for displaying task status
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
