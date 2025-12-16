import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { Task, TaskFilters, TaskPriority, TaskSort, TaskStatus } from "@/types/database";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

const TASKS_KEY = ["tasks"];

/**
 * Fetch all tasks with optional filtering and sorting
 */
async function fetchTasks(filters?: TaskFilters): Promise<Task[]> {
  // Convert filters to query parameters
  const queryParams: any = {};

  if (filters) {
    if (filters.status && filters.status.length > 0) {
      queryParams.status = filters.status.join(",");
    }
    if (filters.priority && filters.priority.length > 0) {
      queryParams.priority = filters.priority.join(",");
    }
    if (filters.assignedToMe) {
      queryParams.assignedToMe = filters.assignedToMe;
    }
    if (filters.createdByMe) {
      queryParams.createdByMe = filters.createdByMe;
    }
    if (filters.overdue) {
      queryParams.overdue = filters.overdue;
    }
  }

  return apiClient.getTasks(queryParams);
}

/**
 * Hook for fetching and managing tasks
 */
export function useTasks(filters?: TaskFilters, sort?: TaskSort) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TASKS_KEY, filters, user?.id],
    queryFn: () => fetchTasks(filters),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  // For now, we'll just invalidate queries periodically
  // In a real app, you'd implement WebSocket connections for real-time updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, queryClient]);

  return query;
}

/**
 * Hook for creating a new task
 */
export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string | null;
      due_date?: string | null;
      priority: TaskPriority;
      status: TaskStatus;
      assigned_to_id?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const data = await apiClient.createTask({
        ...task,
        creator_id: user.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating an existing task
 */
export function useUpdateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const data = await apiClient.updateTask(id, updates);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      await apiClient.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });
}
