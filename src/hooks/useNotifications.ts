import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

const NOTIFICATIONS_KEY = ['notifications'];

/**
 * Fetch user notifications
 */
async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data || []) as Notification[];
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
          
          const notification = payload.new as Notification;
          toast({
            title: notification.title,
            description: notification.message,
          });
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
 * Hook for marking a notification as read
 */
export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/**
 * Get count of unread notifications
 */
export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter(n => !n.read).length || 0;
}
