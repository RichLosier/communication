import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '../components/NotificationManager';

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationManager');
  }
  
  return context;
};