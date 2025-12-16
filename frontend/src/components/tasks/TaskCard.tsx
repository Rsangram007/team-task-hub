import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Task } from '@/types/database';
import { PriorityBadge, StatusBadge } from './TaskBadges';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * Get initials from a name
 */
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format due date with relative labels
 */
function formatDueDate(date: string | null): { text: string; isOverdue: boolean } {
  if (!date) return { text: 'No due date', isOverdue: false };
  
  const dueDate = new Date(date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  
  if (isToday(dueDate)) {
    return { text: 'Today', isOverdue: false };
  }
  if (isTomorrow(dueDate)) {
    return { text: 'Tomorrow', isOverdue: false };
  }
  
  return { text: format(dueDate, 'MMM d, yyyy'), isOverdue };
}

/**
 * Task card component displaying task details
 */
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const dueInfo = formatDueDate(task.due_date);
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'group p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-200',
        'hover:shadow-lg hover:shadow-primary/5 animate-fade-in'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={cn('font-medium text-foreground line-clamp-2', isCompleted && 'line-through opacity-60')}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={task.priority} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {task.description && (
        <p className={cn('text-sm text-muted-foreground mb-4 line-clamp-2', isCompleted && 'line-through opacity-60')}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          
          {task.assigned_to_id && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(task.assignee?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs truncate max-w-[100px]">
                {task.assignee?.full_name || 'Assigned'}
              </span>
            </div>
          )}
        </div>

        {task.due_date && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs',
              dueInfo.isOverdue && !isCompleted ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {dueInfo.isOverdue && !isCompleted ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            {dueInfo.text}
          </div>
        )}
      </div>
    </div>
  );
}
