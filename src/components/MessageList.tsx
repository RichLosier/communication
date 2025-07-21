import React from 'react';
import { Message } from '../types';
import MessageRow from './MessageRow';
import EmptyState from './EmptyState';
import { AlertTriangle, BellRing, Bell } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  // Grouper les messages par priorité
  const messagesByPriority = {
    niveau3: messages.filter(msg => msg.priority === 'niveau3'),
    niveau2: messages.filter(msg => msg.priority === 'niveau2'),
    niveau1: messages.filter(msg => msg.priority === 'niveau1')
  };

  // Trier chaque groupe par timestamp (plus récent en premier)
  Object.keys(messagesByPriority).forEach(priority => {
    messagesByPriority[priority as keyof typeof messagesByPriority].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  const priorityConfig = {
    niveau3: {
      title: 'Urgents',
      icon: AlertTriangle,
      emoji: '🚀',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-800',
      iconBg: 'bg-red-500',
      count: messagesByPriority.niveau3.length
    },
    niveau2: {
      title: 'Importants',
      icon: BellRing,
      emoji: '💪',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      titleColor: 'text-orange-800',
      iconBg: 'bg-orange-500',
      count: messagesByPriority.niveau2.length
    },
    niveau1: {
      title: 'Informatifs',
      icon: Bell,
      emoji: '🔔',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-800',
      iconBg: 'bg-blue-500',
      count: messagesByPriority.niveau1.length
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Niveau 3 - Urgent - LAYOUT HORIZONTAL */}
      {messagesByPriority.niveau3.length > 0 && (
        <div className={`${priorityConfig.niveau3.bgColor} ${priorityConfig.niveau3.borderColor} border-2 rounded-xl p-4`}>
          <div className="flex items-start gap-4">
            {/* Titre de section à gauche */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[180px]">
              <div className={`${priorityConfig.niveau3.iconBg} rounded-xl p-2`}>
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${priorityConfig.niveau3.titleColor}`}>
                  {priorityConfig.niveau3.emoji} {priorityConfig.niveau3.title}
                </h3>
                <p className="text-red-600 text-xs">
                  {priorityConfig.niveau3.count} message{priorityConfig.niveau3.count > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Messages à droite sur la même ligne */}
            <div className="flex-grow space-y-1">
              {messagesByPriority.niveau3.map((message, index) => (
                <MessageRow 
                  key={message.id} 
                  message={message} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Niveau 2 - Important - LAYOUT HORIZONTAL */}
      {messagesByPriority.niveau2.length > 0 && (
        <div className={`${priorityConfig.niveau2.bgColor} ${priorityConfig.niveau2.borderColor} border-2 rounded-xl p-4`}>
          <div className="flex items-start gap-4">
            {/* Titre de section à gauche */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[180px]">
              <div className={`${priorityConfig.niveau2.iconBg} rounded-xl p-2`}>
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${priorityConfig.niveau2.titleColor}`}>
                  {priorityConfig.niveau2.emoji} {priorityConfig.niveau2.title}
                </h3>
                <p className="text-orange-600 text-xs">
                  {priorityConfig.niveau2.count} message{priorityConfig.niveau2.count > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Messages à droite sur la même ligne */}
            <div className="flex-grow space-y-1">
              {messagesByPriority.niveau2.map((message, index) => (
                <MessageRow 
                  key={message.id} 
                  message={message} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Niveau 1 - Informatif - LAYOUT HORIZONTAL */}
      {messagesByPriority.niveau1.length > 0 && (
        <div className={`${priorityConfig.niveau1.bgColor} ${priorityConfig.niveau1.borderColor} border-2 rounded-xl p-4`}>
          <div className="flex items-start gap-4">
            {/* Titre de section à gauche */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[180px]">
              <div className={`${priorityConfig.niveau1.iconBg} rounded-xl p-2`}>
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${priorityConfig.niveau1.titleColor}`}>
                  {priorityConfig.niveau1.emoji} {priorityConfig.niveau1.title}
                </h3>
                <p className="text-blue-600 text-xs">
                  {priorityConfig.niveau1.count} message{priorityConfig.niveau1.count > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Messages à droite sur la même ligne */}
            <div className="flex-grow space-y-1">
              {messagesByPriority.niveau1.map((message, index) => (
                <MessageRow 
                  key={message.id} 
                  message={message} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;