export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  creator_id: string;
  creator_name?: string;
  creator_avatar?: string;
  assigned_to_id: string | null;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedToMe?: string;
  createdByMe?: string;
  overdue?: boolean;
}

export interface TaskSort {
  field: string;
  direction: "asc" | "desc";
}
