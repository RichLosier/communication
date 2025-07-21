import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, AlertTriangle, Bell, BellRing, Zap } from 'lucide-react';
import { Message } from '../types';
import { useMessageStore } from '../store/messageStore';
import { useNotification } from '../hooks/useNotification';

interface MessageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

const priorityIcons = {
  niveau1: Bell,
  niveau2: BellRing,
  niveau3: AlertTriangle
};

const MessageEditModal: React.FC<MessageEditModalProps> = ({ isOpen, onClose, message }) => {
  const [formData, setFormData] = useState({
    title: message.title,
    description: message.description,
    priority: message.priority,
    isFlashing: message.isFlashing || false
  });

  const { updateMessage } = useMessageStore();
  const { showSuccess, showError } = useNotification();

  // Mettre à jour le formulaire quand le message change
  useEffect(() => {
    setFormData({
      title: message.title,
      description: message.description,
      priority: message.priority,
      isFlashing: message.isFlashing || false
    });
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedMessage: Message = {
        ...message,
        title: formData.title || 'Message vide',
        description: formData.description,
        priority: formData.priority,
        isFlashing: formData.isFlashing
      };

      await updateMessage(updatedMessage);
      
      const flashText = formData.isFlashing ? " avec effet flash" : "";
      showSuccess(
        "Message modifié",
        `Le message "${formData.title || 'Message vide'}" a été mis à jour avec succès${flashText}.`
      );
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
      showError(
        "Erreur",
        "Impossible de modifier le message. Vérifiez votre connexion."
      );
    }
  };

  // Gestion des touches clavier pour sauvegarder avec Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        
        // Permettre la sauvegarde même avec un titre vide
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, formData]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Save className="h-6 w-6" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold">Modifier le message</Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1">Apportez vos modifications</p>
                  <p className="text-blue-200 text-xs mt-1">💡 Ctrl+Enter pour sauvegarder rapidement</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du message
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Titre optionnel..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour un message sans titre
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenu du message
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  rows={6}
                  placeholder="Contenu optionnel..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ajoutez des détails si nécessaire
                </p>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Niveau de priorité
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['niveau1', 'niveau2', 'niveau3'] as const).map((priority) => {
                    const Icon = priorityIcons[priority];
                    const isSelected = formData.priority === priority;
                    const labels = {
                      niveau1: { label: 'Niveau 1', desc: 'Information', color: 'blue' },
                      niveau2: { label: 'Niveau 2', desc: 'Important', color: 'orange' },
                      niveau3: { label: 'Niveau 3', desc: 'Urgent', color: 'red' }
                    };
                    const config = labels[priority];
                    
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority }))}
                        className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
                          isSelected
                            ? priority === 'niveau3' 
                              ? 'border-red-500 bg-red-500 text-white shadow-lg scale-105'
                              : priority === 'niveau2'
                              ? 'border-orange-500 bg-orange-500 text-white shadow-lg scale-105'
                              : 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="h-6 w-6" />
                          <span className="font-semibold">{config.label}</span>
                          <span className="text-xs opacity-80">{config.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option Flash */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlashing}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFlashing: e.target.checked }))}
                    className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                  />
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <span className="font-semibold text-yellow-800">⚡ Message flash</span>
                      <p className="text-sm text-yellow-700">Effet de clignotement doux pour attirer l'attention</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <Save className="h-5 w-5" />
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MessageEditModal;