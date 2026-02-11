import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Alias for backwards compatibility
export const useNotification = useNotifications;

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Load notifications from API (when service is available)
  useEffect(() => {
    if (user) {
      // TODO: Load notifications from notificationService.getMyNotifications()
      // For now, start with empty array
      setNotifications([]);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (notificationId) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      userId: user?.id,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    setNotifications([newNotification, ...notifications]);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
