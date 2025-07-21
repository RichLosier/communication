import React, { useState } from 'react';
import { Message } from '../types';
import { Trash2, Edit3, AlertTriangle, Bell, BellRing } from 'lucide-react';
import { useMessageStore } from '../store/messageStore';
import { useNotification } from '../hooks/useNotification';
import MessageEditModal from './MessageEditModal';

interface MessageRowProps {
  message: Message;
  index: number;
}

// Configuration des icônes de priorité avec emojis
const priorityConfig = {
  niveau1: {
    icon: Bell,
    iconClass: "text-blue-600",
    emoji: "🔔" // Cloche simple pour niveau 1
  },
  niveau2: {
    icon: BellRing,
    iconClass: "text-orange-600", 
    emoji: "💪" // Bras qui force pour niveau 2
  },
  niveau3: {
    icon: AlertTriangle,
    iconClass: "text-red-600",
    emoji: "🚀" // Fusée pour niveau 3
  }
};

const MessageRow: React.FC<MessageRowProps> = ({ message, index }) => {
  const { deleteMessage } = useMessageStore();
  const { showSuccess, showError } = useNotification();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Obtenir la configuration de priorité
  const priorityConf = priorityConfig[message.priority];

  const cleanDescription = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/🚗|🏷️|📏|💰|📞|🏢|💬|📝/g, '')
      .trim();
  };

  const hasDescription = message.description && message.description.trim() !== '' && message.description.trim() !== ' ';

  // Créer le contenu complet sur une seule ligne : TITRE - DESCRIPTION
  const createSingleLineContent = () => {
    let content = message.title || '';
    
    if (hasDescription) {
      const cleanedDesc = cleanDescription(message.description);
      if (cleanedDesc) {
        // Si on a un titre ET une description, les séparer par " - "
        if (content) {
          content += ` - ${cleanedDesc}`;
        } else {
          // Si pas de titre mais une description
          content = cleanedDesc;
        }
      }
    }
    
    return content || 'Message vide';
  };

  const singleLineContent = createSingleLineContent();

  const handleDelete = async () => {
    if (window.confirm('Supprimer ce message ?')) {
      try {
        await deleteMessage(message.id);
        showSuccess(
          "Message supprimé",
          `Le message "${message.title}" a été supprimé avec succès.`
        );
      } catch (error) {
        console.error('Erreur lors de la suppression du message:', error);
        showError(
          "Erreur",
          "Impossible de supprimer le message. Vérifiez votre connexion."
        );
      }
    }
  };

  return (
    <>
      <div 
        className={`
          bg-white border border-gray-200 rounded-lg px-3 py-1.5 mb-2
          hover:shadow-md hover:border-gray-300 transition-all duration-200
          animate-slide-in-stagger
          ${message.isFlashing ? 'animate-flash-message-fast' : ''}
        `}
        style={{ 
          animationDelay: `${index * 20}ms`,
          height: '40px' // Hauteur réduite pour une ligne plus compacte
        }}
      >
        <div className="flex items-center justify-between gap-3 h-full">
          {/* Contenu principal sur une seule ligne */}
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {/* Emoji de priorité + indicateur flash */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-base" title={`Priorité ${message.priority}`}>
                {priorityConf.emoji}
              </span>
              {message.isFlashing && (
                <span className="text-cyan-400 animate-pulse text-xs">⚡</span>
              )}
            </div>
            
            {/* TITRE - DESCRIPTION sur une ligne avec truncate */}
            <div className="flex-grow min-w-0">
              <div 
                className="text-sm font-medium truncate text-gray-900"
                title={singleLineContent} // Tooltip pour voir le contenu complet
              >
                {singleLineContent}
              </div>
            </div>
          </div>
          
          {/* Actions - Seulement modifier et supprimer */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              title="Modifier"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <MessageEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        message={message}
      />
    </>
  );
};

export default MessageRow;