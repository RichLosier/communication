import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Plus, X, AlertTriangle, Bell, BellRing, Send, Zap, User, Building } from 'lucide-react';
import { useMessageStore } from '../store/messageStore';
import { useNotification } from '../hooks/useNotification';
import { Message } from '../types';
import { playMessageNotificationSound, playUrgentMessageSound, playBannerAlertSound } from '../utils/audioUtils';

const priorityIcons = {
  niveau1: Bell,
  niveau2: BellRing,
  niveau3: AlertTriangle
};

const MessageEditor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [priority, setPriority] = useState<Message['priority']>('niveau2');
  const [isPriorityBanner, setIsPriorityBanner] = useState(false);
  const [bannerColor, setBannerColor] = useState<'red' | 'green'>('red');
  const [isFlashMessage, setIsFlashMessage] = useState(false);
  
  // Nouveaux champs pour les clients
  const [clientName, setClientName] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [isClientMessage, setIsClientMessage] = useState(false);

  const { addMessage, updatePriorityAlert } = useMessageStore();
  const { showSuccess, showWarning } = useNotification();

  const resetForm = () => {
    setMessageText('');
    setPriority('niveau2');
    setIsPriorityBanner(false);
    setIsFlashMessage(false);
    setClientName('');
    setDealerName('');
    setIsClientMessage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si c'est un message client, on utilise les noms du client et dealer
    let finalTitle = messageText;
    if (isClientMessage && (clientName || dealerName)) {
      const parts = [];
      if (clientName) parts.push(`Client: ${clientName}`);
      if (dealerName) parts.push(`Dealer: ${dealerName}`);
      finalTitle = parts.join(' • ');
      
      // Si il y a aussi un message personnalisé, l'ajouter
      if (messageText.trim()) {
        finalTitle += ` • ${messageText}`;
      }
    }

    if (!finalTitle.trim()) {
      finalTitle = 'Message vide';
    }

    try {
      // Son pour message permanent
      if (isPriorityBanner) {
        playBannerAlertSound();
      } else if (priority === 'niveau3') {
        playUrgentMessageSound();
      } else {
        playMessageNotificationSound();
      }
      
      await addMessage({
        title: finalTitle,
        description: '',
        priority,
        sender: '',
        isFlashing: isFlashMessage,
        clientName: isClientMessage ? clientName : undefined,
        dealerName: isClientMessage ? dealerName : undefined
      });
      
      if (isPriorityBanner) {
        await updatePriorityAlert({
          active: true,
          message: finalTitle,
          color: bannerColor
        });
        showWarning(
          "🔊 Alerte prioritaire activée",
          `Le message "${finalTitle}" est maintenant affiché en bannière prioritaire avec notification sonore.`
        );
      } else {
        const flashText = isFlashMessage ? " avec effet flash" : "";
        const clientText = isClientMessage ? " (nouveau client)" : "";
        showSuccess(
          "🔊 Message publié",
          `Le message "${finalTitle}" a été ajouté avec succès${flashText}${clientText} et une notification sonore a été envoyée.`
        );
      }
      
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      showWarning(
        'Erreur',
        'Impossible de créer le message. Vérifiez votre connexion.'
      );
    }
  };

  // Gestion des touches clavier pour sauvegarder avec Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        
        // Permettre l'envoi même avec un message vide
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
  }, [isOpen, messageText, priority, isPriorityBanner, isFlashMessage, clientName, dealerName, isClientMessage]);

  return (
    <>
      {/* Bouton + compact intégré dans la section */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 transition-colors font-medium shadow-lg hover:shadow-xl"
        title="Nouveau message"
      >
        <Plus className="h-5 w-5" />
        <span>Nouveau</span>
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-2xl p-2">
                    <Send className="h-6 w-6" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold">Nouveau message</Dialog.Title>
                    <p className="text-blue-100 mt-1">Écrivez votre message rapidement</p>
                    <p className="text-blue-200 text-sm mt-1">🔊 Notification sonore automatique • 💡 Ctrl+Enter pour envoyer</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de message */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200">
                  <label className="block text-lg font-semibold text-purple-800 mb-3">
                    Type de message
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsClientMessage(false)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        !isClientMessage
                          ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Send className="h-5 w-5" />
                        <span className="font-semibold">Message général</span>
                        <span className="text-xs opacity-80">Communication d'équipe</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsClientMessage(true)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isClientMessage
                          ? 'border-green-500 bg-green-500 text-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="font-semibold">Nouveau client</span>
                        <span className="text-xs opacity-80">À assigner avec SMS</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Champs pour nouveau client */}
                {isClientMessage && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Informations du client</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          Nom du client
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                          placeholder="Ex: Jean Dupont"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          <Building className="h-4 w-4 inline mr-1" />
                          Nom du dealer
                        </label>
                        <input
                          type="text"
                          value={dealerName}
                          onChange={(e) => setDealerName(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                          placeholder="Ex: Concessionnaire ABC"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mt-3">
                      💡 Quand vous assignerez ce client, un SMS sera automatiquement envoyé au vendeur
                    </p>
                  </div>
                )}

                {/* Champ texte libre */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                  <label className="block text-lg font-semibold text-blue-800 mb-3">
                    {isClientMessage ? 'Message additionnel (optionnel)' : 'Votre message'}
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg"
                    rows={4}
                    placeholder={isClientMessage ? "Informations supplémentaires..." : "Tapez votre message ici... (optionnel)"}
                    autoFocus={!isClientMessage}
                  />
                  <p className="text-sm text-blue-600 mt-2">
                    💡 {isClientMessage ? 'Ajoutez des détails si nécessaire' : 'Vous pouvez laisser vide pour créer un message rapide'}
                  </p>
                </div>

                {/* Sélection de priorité */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">Priorité et son</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['niveau1', 'niveau2', 'niveau3'] as const).map((priorityLevel) => {
                      const Icon = priorityIcons[priorityLevel];
                      const isSelected = priority === priorityLevel;
                      const labels = {
                        niveau1: { label: 'Normal', desc: 'Information', color: 'blue', sound: '🔔 Son doux' },
                        niveau2: { label: 'Important', desc: 'À noter', color: 'orange', sound: '🔔 Son standard' },
                        niveau3: { label: 'Urgent', desc: 'Prioritaire', color: 'red', sound: '🚨 Son d\'urgence' }
                      };
                      const config = labels[priorityLevel];
                      
                      return (
                        <button
                          key={priorityLevel}
                          type="button"
                          onClick={() => setPriority(priorityLevel)}
                          className={`relative overflow-hidden rounded-xl border-2 p-3 transition-all duration-300 ${
                            isSelected
                              ? priorityLevel === 'niveau3' 
                                ? 'border-red-500 bg-red-500 text-white shadow-lg scale-105'
                                : priorityLevel === 'niveau2'
                                ? 'border-orange-500 bg-orange-500 text-white shadow-lg scale-105'
                                : 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Icon className="h-5 w-5" />
                            <span className="font-semibold text-sm">{config.label}</span>
                            <span className="text-xs opacity-80">{config.desc}</span>
                            <span className="text-xs opacity-70">{config.sound}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Options avancées */}
                {!isClientMessage && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Options avancées</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFlashMessage}
                          onChange={(e) => setIsFlashMessage(e.target.checked)}
                          className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                        />
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <div>
                            <span className="font-medium text-gray-800">⚡ Message flash</span>
                            <p className="text-sm text-gray-600">Effet de clignotement doux pour attirer l'attention</p>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPriorityBanner}
                          onChange={(e) => setIsPriorityBanner(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-800">🚨 Bannière prioritaire</span>
                          <p className="text-sm text-gray-600">Affichage permanent en haut de page avec son d'alerte</p>
                        </div>
                      </label>

                      {isPriorityBanner && (
                        <div className="ml-7 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setBannerColor('red')}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition-all text-sm ${
                              bannerColor === 'red'
                                ? 'border-gray-800 bg-white text-gray-800 shadow-md'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Urgent
                          </button>
                          <button
                            type="button"
                            onClick={() => setBannerColor('green')}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition-all text-sm ${
                              bannerColor === 'green'
                                ? 'border-gray-800 bg-white text-gray-800 shadow-md'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Information
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Send className="h-4 w-4" />
                    {isClientMessage ? '👤 Créer Client' : '🔊 Publier Message'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default MessageEditor;