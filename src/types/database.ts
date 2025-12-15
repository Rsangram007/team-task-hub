/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task status options
 */
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

/**
 * User profile type
 */
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Task entity type
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  creator_id: string;
  assigned_to_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  creator?: Profile;
  assignee?: Profile;
}

/**
 * Notification entity type
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
  task?: Task;
}

/**
 * Audit log entry type
 */
export interface TaskAuditLog {
  id: string;
  task_id: string;
  user_id: string | null;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Filter options for tasks
 */
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedToMe?: boolean;
  createdByMe?: boolean;
  overdue?: boolean;
}

/**
 * Sort options for tasks
 */
export interface TaskSort {
  field: 'due_date' | 'created_at' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}
