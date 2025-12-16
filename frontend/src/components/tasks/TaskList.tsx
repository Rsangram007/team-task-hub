import { Task, TaskFilters, TaskSort } from '@/types/database';
import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskSkeleton';
import { ListFilter, AlertCircle, Inbox } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

/**
 * List component for displaying tasks
 */
export function TaskList({ tasks, isLoading, onEdit, onDelete, emptyMessage = 'No tasks found' }: TaskListProps) {
  if (isLoading) {
    return <TaskListSkeleton count={5} />;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
