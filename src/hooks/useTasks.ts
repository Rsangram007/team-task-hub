import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFilters, TaskSort, TaskPriority, TaskStatus } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

const TASKS_KEY = ['tasks'];

/**
 * Fetch all tasks with optional filtering and sorting
 */
async function fetchTasks(filters?: TaskFilters, sort?: TaskSort, userId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*');

  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters.assignedToMe && userId) {
      query = query.eq('assigned_to_id', userId);
    }
    if (filters.createdByMe && userId) {
      query = query.eq('creator_id', userId);
    }
    if (filters.overdue) {
      query = query.lt('due_date', new Date().toISOString()).neq('status', 'completed');
    }
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as Task[];
}

/**
 * Hook for fetching and managing tasks
 */
export function useTasks(filters?: TaskFilters, sort?: TaskSort) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TASKS_KEY, filters, sort, user?.id],
    queryFn: () => fetchTasks(filters, sort, user?.id),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: TASKS_KEY });
          
          // Show toast for updates from other users
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newTask = payload.new as Task;
            if (newTask.assigned_to_id === user.id && payload.old && (payload.old as Task).assigned_to_id !== user.id) {
              toast({
                title: 'Task assigned to you',
                description: newTask.title,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create notification if assigned to someone else
      if (task.assigned_to_id && task.assigned_to_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: task.assigned_to_id,
          title: 'New task assigned',
          message: `You have been assigned to: ${task.title}`,
          task_id: data.id,
        });
      }

      // Create audit log
      await supabase.from('task_audit_log').insert({
        task_id: data.id,
        user_id: user.id,
        action: 'created',
        new_value: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({ title: 'Task created', description: 'Your task has been created successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      if (!user) throw new Error('Not authenticated');

      // Get old task for audit
      const { data: oldTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create notification if assignee changed
      if (updates.assigned_to_id && updates.assigned_to_id !== oldTask?.assigned_to_id && updates.assigned_to_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: updates.assigned_to_id,
          title: 'Task assigned to you',
          message: `You have been assigned to: ${data.title}`,
          task_id: id,
        });
      }

      // Create audit log
      await supabase.from('task_audit_log').insert({
        task_id: id,
        user_id: user.id,
        action: 'updated',
        old_value: oldTask,
        new_value: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({ title: 'Task updated', description: 'Your changes have been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast({ title: 'Task deleted', description: 'The task has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
