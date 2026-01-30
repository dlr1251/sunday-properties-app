import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  userId: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'counter_offer' | 'negotiation_update' | 'system' |
        'verification_approved' | 'verification_rejected' | 'property_approved' | 'property_rejected' |
        'visit_scheduled' | 'visit_confirmed' | 'visit_cancelled' | 'visit_reminder' | 'visit_rescheduled' |
        'new_offer' | 'offer_rejected' | 'negotiation_closed_buyer' | 'negotiation_closed_seller' |
        'new_report' | 'report_status_update' | 'account_action';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId]);

  // Create notification
  const createNotification = useCallback(async (
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [userId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const newChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [userId, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [channel]);

  // Send notification to specific user
  const sendNotification = useCallback(async (
    targetUserId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type,
          title,
          message,
          data,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Send notification to multiple users
  const sendBulkNotification = useCallback(async (
    userIds: string[],
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type: Notification['type']) => {
    const icons: Record<string, string> = {
      offer_received: '💰',
      offer_accepted: '✅',
      offer_rejected: '❌',
      counter_offer: '🔄',
      negotiation_update: '📝',
      system: '⚙️',
      verification_approved: '✅',
      verification_rejected: '❌',
      property_approved: '🏠',
      property_rejected: '❌',
      visit_scheduled: '📅',
      visit_confirmed: '✅',
      visit_cancelled: '❌',
      visit_reminder: '⏰',
      visit_rescheduled: '🔄',
      new_offer: '💰',
      offer_rejected: '❌',
      negotiation_closed_buyer: '🎉',
      negotiation_closed_seller: '🎉',
      new_report: '🚨',
      report_status_update: '📋',
      account_action: '👤'
    };
    return icons[type] || '📢';
  }, []);

  // Get notification priority
  const getNotificationPriority = useCallback((type: Notification['type']) => {
    const priorities: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      verification_approved: 'high',
      verification_rejected: 'medium',
      property_approved: 'high',
      property_rejected: 'medium',
      visit_scheduled: 'medium',
      visit_confirmed: 'medium',
      visit_cancelled: 'medium',
      visit_reminder: 'high',
      visit_rescheduled: 'medium',
      offer_received: 'high',
      offer_accepted: 'high',
      offer_rejected: 'medium',
      counter_offer: 'high',
      negotiation_closed_buyer: 'critical',
      negotiation_closed_seller: 'critical',
      new_report: 'high',
      report_status_update: 'medium',
      account_action: 'high',
      system: 'low',
      negotiation_update: 'medium',
      new_offer: 'medium'
    };
    return priorities[type] || 'medium';
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    sendNotification,
    sendBulkNotification,
    getNotificationIcon,
    getNotificationPriority,
    refreshNotifications: fetchNotifications
  };
};