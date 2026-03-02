/**
 * Notification Service
 * Handles user notifications
 */

import api from './api';

export interface Notification {
  id: string;
  notificationId?: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  recipientId?: string;
  relatedJobId?: string;
  relatedApplicationId?: string;
  isRead?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  type: string;
  recipientId?: string;
  relatedJobId?: string;
  relatedApplicationId?: string;
}

const notificationService = {
  /**
   * Get my notifications
   */
  getMyNotifications: async (isRead?: boolean) => {
    try {
      const params = isRead !== undefined ? { isRead } : {};
      const res = await api.get<Notification[]>('/notifications', { params });
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    try {
      const res = await api.get<number>('/notifications/unread/count');
      return res;
    } catch (error) {
      return { data: 0 };
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string) => {
    try {
      const res = await api.put(`/notifications/${notificationId}/read`);
      return res;
    } catch (error) {
      console.error(`Failed to mark notification as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const res = await api.put('/notifications/read-all');
      return res;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  delete: async (notificationId: string) => {
    try {
      const res = await api.delete(`/notifications/${notificationId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete notification:`, error);
      throw error;
    }
  },

  /**
   * Delete all notifications
   */
  deleteAll: async () => {
    try {
      const res = await api.delete('/notifications/delete-all');
      return res;
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  },

  /**
   * Send notification (Admin only)
   */
  send: async (notificationData: NotificationCreateRequest) => {
    try {
      const res = await api.post<Notification>('/notifications', notificationData);
      return res;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  },
};

export default notificationService;
