import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number; // en millisecondes, défaut 5000
  autoClose?: boolean; // défaut true
}

interface InstantNotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

const InstantNotification: React.FC<InstantNotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      progressColor: 'bg-orange-500'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;
  const duration = notification.duration || 5000;
  const autoClose = notification.autoClose !== false;

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true);

    if (autoClose) {
      // Timer pour fermer automatiquement
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Durée de l'animation de sortie
  };

  return (
    <div
      className={`
        w-full max-w-md mx-auto
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        ${config.bgColor}
        border-2 ${config.borderColor}
        rounded-2xl shadow-xl p-5
        backdrop-blur-sm
        relative overflow-hidden
      `}>
        {/* Effet de brillance */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative flex items-start gap-4">
          <div className={`flex-shrink-0 ${config.iconColor} bg-white rounded-xl p-2 shadow-md`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-grow min-w-0">
            <h4 className="font-bold text-lg mb-2 text-gray-900">{notification.title}</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{notification.message}</p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {autoClose && (
          <div className="mt-4 bg-white/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full animate-progress-countdown ${config.progressColor}`}
              style={{ 
                animationDuration: `${duration}ms`,
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantNotification;