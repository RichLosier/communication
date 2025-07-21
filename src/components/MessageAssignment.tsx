import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, User, X, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useMessageStore } from '../store/messageStore';
import { useNotification } from '../hooks/useNotification';
import { Message } from '../types';

interface MessageAssignmentProps {
  message: Message;
  onSuccess?: () => void;
}

const MessageAssignment: React.FC<MessageAssignmentProps> = ({ message, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { teamMembers, assignMessage, unassignMessage } = useMessageStore();
  const { showSuccess: showNotification, showError } = useNotification();

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sendSMSNotification = async (memberName: string, phoneNumber: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberName,
          phoneNumber,
          clientName: message.clientName || 'Client non spécifié',
          dealerName: message.dealerName || 'Dealer non spécifié'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('SMS envoyé avec succès:', result.preview);
        return true;
      } else {
        console.error('Erreur SMS:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi SMS:', error);
      return false;
    }
  };

  const handleAssign = async (memberName: string) => {
    setIsLoading(true);
    try {
      await assignMessage(message.id, memberName);
      
      // Si c'est un message client, envoyer le SMS
      if (message.clientName || message.dealerName) {
        const member = teamMembers.find(m => m.name === memberName);
        if (member?.phone_number) {
          const smsSuccess = await sendSMSNotification(memberName, member.phone_number);
          
          if (smsSuccess) {
            showNotification(
              "🎯📱 Client assigné avec SMS",
              `${memberName} s'occupe maintenant de ce client ! Un SMS a été envoyé avec les détails. Le message va disparaître du tableau principal.`
            );
          } else {
            showNotification(
              "🎯 Client assigné",
              `${memberName} s'occupe maintenant de ce client ! (SMS non envoyé - vérifiez la configuration). Le message va disparaître du tableau principal.`
            );
          }
        } else {
          showNotification(
            "🎯 Client assigné",
            `${memberName} s'occupe maintenant de ce client ! (Pas de numéro de téléphone configuré pour le SMS). Le message va disparaître du tableau principal.`
          );
        }
      } else {
        showNotification(
          "📤 Message envoyé",
          `Le message a été envoyé à ${memberName} ! Il va disparaître du tableau principal.`
        );
      }
      
      // Effet de succès
      setShowSuccess(true);
      setIsOpen(false);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000); // Délai plus long pour voir l'effet
      }

      // Cacher l'effet après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      showError(
        "Erreur d'assignation",
        "Impossible d'assigner ce client. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async () => {
    setIsLoading(true);
    try {
      await unassignMessage(message.id);
      const isClientMessage = message.clientName || message.dealerName;
      showNotification(
        isClientMessage ? "🔄 Client libéré" : "🔄 Message libéré",
        `Ce ${isClientMessage ? 'client' : 'message'} est maintenant disponible pour assignation et réapparaîtra dans le tableau principal.`
      );
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la désassignation:', error);
      showError(
        "Erreur",
        "Impossible de libérer ce client. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Effet de succès overlay avec animation de disparition
  if (showSuccess) {
    const isClientMessage = message.clientName || message.dealerName;
    return (
      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-lg text-xs font-medium animate-pulse-subtle">
        <CheckCircle className="h-3 w-3" />
        <span>{isClientMessage ? 'Client assigné !' : 'Message envoyé !'}</span>
      </div>
    );
  }

  // Si le message est déjà assigné (ne devrait pas apparaître dans le tableau principal)
  if (message.assignedTo) {
    const isClientMessage = message.clientName || message.dealerName;
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded-lg text-xs font-medium transition-colors border border-green-300 disabled:opacity-50"
          title={`${isClientMessage ? 'Client pris en charge' : 'Message envoyé'} par ${message.assignedTo} le ${message.assignedAt}`}
        >
          <CheckCircle className="h-3 w-3" />
          <span className="max-w-16 truncate">{message.assignedTo}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-48">
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-700">
                {isClientMessage ? 'Client pris en charge par:' : 'Message envoyé à:'}
              </div>
              <div className="text-sm font-semibold text-green-700 flex items-center gap-1">
                <User className="h-4 w-4" />
                {message.assignedTo}
              </div>
              {message.assignedAt && (
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {message.assignedAt}
                </div>
              )}
              {(message.clientName || message.dealerName) && (
                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <MessageSquare className="h-3 w-3" />
                  SMS envoyé
                </div>
              )}
            </div>
            
            <button
              onClick={handleUnassign}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {isClientMessage ? 'Libérer ce client' : 'Libérer ce message'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Si le message n'est pas assigné
  const isClientMessage = message.clientName || message.dealerName;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors border disabled:opacity-50 ${
          isClientMessage 
            ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
            : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300'
        }`}
        title={isClientMessage ? "Assigner ce client" : "Envoyer ce message"}
      >
        <Check className="h-3 w-3" />
        <span>{isClientMessage ? 'Assigner' : 'Envoyer'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-40">
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-700">
              {isClientMessage ? 'Qui prend ce client ?' : 'Envoyer à qui ?'}
            </div>
            {isClientMessage && (
              <div className="text-xs text-green-600 mt-1">
                📱 SMS automatique envoyé
              </div>
            )}
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleAssign(member.name)}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <User className="h-4 w-4 text-blue-600" />
                <span>{member.name}</span>
                {isClientMessage && member.phone_number && (
                  <MessageSquare className="h-3 w-3 text-green-500 ml-auto" title="SMS sera envoyé" />
                )}
              </button>
            ))}
          </div>
          
          {teamMembers.length === 0 && (
            <div className="p-3 text-xs text-gray-500 text-center">
              Aucun membre d'équipe disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageAssignment;