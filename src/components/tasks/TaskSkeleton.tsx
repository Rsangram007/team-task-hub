import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

/**
 * Skeleton loading card for tasks
 */
export function TaskCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn('p-4 rounded-lg border border-border bg-card animate-pulse', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loading list for multiple task cards
 */
export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for dashboard stats
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border bg-card animate-pulse">
          <div className="h-4 w-20 bg-muted rounded mb-2" />
          <div className="h-8 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
