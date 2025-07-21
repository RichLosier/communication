import React, { useState, useCallback } from 'react';
import InstantNotification, { NotificationData } from './InstantNotification';

interface NotificationManagerProps {
  children: React.ReactNode;
}

export interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
}

export const NotificationContext = React.createContext<NotificationContextType | null>(null);

const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notificationData: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const notification: NotificationData = {
      ...notificationData,
      id
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration = 5000) => {
    showNotification({ type: 'success', title, message, duration });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, duration = 7000) => {
    showNotification({ type: 'error', title, message, duration });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, duration = 5000) => {
    showNotification({ type: 'info', title, message, duration });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, duration = 6000) => {
    showNotification({ type: 'warning', title, message, duration });
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Conteneur des notifications - Repositionné et corrigé */}
      <div className="fixed top-4 right-4 z-[9999] w-full max-w-md pointer-events-none">
        <div className="space-y-3 pointer-events-auto">
          {notifications.map((notification, index) => (
            <div 
              key={notification.id}
              style={{ 
                transform: `translateY(${index * 8}px)`,
                zIndex: 1000 - index 
              }}
            >
              <InstantNotification
                notification={notification}
                onClose={removeNotification}
              />
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationManager;