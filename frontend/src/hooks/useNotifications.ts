import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { Notification } from "@/types/database";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/WebSocketContext";

const NOTIFICATIONS_KEY = ["notifications"];

/**
 * Fetch user notifications
 */
async function fetchNotifications(): Promise<Notification[]> {
  return apiClient.getNotifications();
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();

  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, user?.id],
    queryFn: () => fetchNotifications(),
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Listen for real-time notification events
  useEffect(() => {
    if (!socket || !user) return;

    const handleNotificationCreated = (notification: Notification) => {
      // Add the new notification to the cache
      queryClient.setQueryData<Notification[]>(
        [...NOTIFICATIONS_KEY, user.id],
        (oldData) => {
          if (!oldData) return [notification];

          // Check if notification already exists to prevent duplicates
          if (oldData.some((n) => n.id === notification.id)) {
            return oldData;
          }

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
          });

          // Add new notification to the beginning of the list
          return [notification, ...oldData];
        }
      );
    };

    // Listen for notification events
    socket.on("notification_created", handleNotificationCreated);

    // Cleanup listener on unmount
    return () => {
      socket.off("notification_created", handleNotificationCreated);
    };
  }, [socket, user, queryClient]);

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
      if (!user) throw new Error("Not authenticated");
      return apiClient.markNotificationAsRead(id);
    },
    onSuccess: (_, id) => {
      // Update the notification in cache to mark it as read
      queryClient.setQueryData<Notification[]>(
        [...NOTIFICATIONS_KEY, user?.id],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((n) => (n.id === id ? { ...n, read: true } : n));
        }
      );

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
      if (!user) throw new Error("Not authenticated");
      return apiClient.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      // Mark all notifications as read in cache
      queryClient.setQueryData<Notification[]>(
        [...NOTIFICATIONS_KEY, user?.id],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((n) => ({ ...n, read: true }));
        }
      );

      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/**
 * Get count of unread notifications
 */
export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.read).length || 0;
}
