import React, { useEffect, useState } from 'react';
import DigitalClock from './components/DigitalClock';
import PriorityBanner from './components/PriorityBanner';
import MessageList from './components/MessageList';
import LastUpdate from './components/LastUpdate';
import MessageEditor from './components/MessageEditor';
import NotificationManager from './components/NotificationManager';
import AdminPanel from './components/AdminPanel';
import { useMessageStore } from './store/messageStore';
import { Settings } from 'lucide-react';

function App() {
  const { messages, priorityAlert, loadMessages, loadPriorityAlert, loadTeamMembers } = useMessageStore();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filtrer les messages pour ne montrer que ceux non assignés
  const unassignedMessages = messages.filter(message => !message.assignedTo);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadMessages(),
          loadPriorityAlert(),
          loadTeamMembers()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [loadMessages, loadPriorityAlert, loadTeamMembers]);

  // Actualiser les données périodiquement
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all([
          loadMessages(),
          loadPriorityAlert(),
          loadTeamMembers()
        ]);
      } catch (error) {
        console.error('Erreur lors de l\'actualisation des données:', error);
      }
    }, 30000); // Actualiser toutes les 30 secondes

    return () => clearInterval(interval);
  }, [loadMessages, loadPriorityAlert, loadTeamMembers]);

  return (
    <NotificationManager>
      <div className="min-h-screen bg-gray-50 flex flex-col text-sm">
        {/* Priority Banner */}
        <PriorityBanner alert={priorityAlert} />
        
        {/* Header avec Logo et Clock */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[75%] mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img 
                  src="/wx-logo-stacked-brandred-black.png" 
                  alt="WholesaleXpress" 
                  className="h-12"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Communications Internes</h1>
                  <p className="text-sm text-gray-600">Bureau des ventes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <LastUpdate />
                <DigitalClock />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content - Messages uniquement */}
        <main className="flex-grow max-w-[75%] mx-auto px-4 py-6 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages de l'équipe</h2>
                <p className="text-gray-600">
                  {unassignedMessages.length === 0 
                    ? "Aucun message en attente" 
                    : `${unassignedMessages.length} message${unassignedMessages.length > 1 ? 's' : ''} en attente d'assignation`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {unassignedMessages.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Triés par priorité et date
                  </div>
                )}
                
                {/* Bouton Admin */}
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 transition-colors font-medium shadow-lg hover:shadow-xl"
                  title="Panneau d'administration"
                >
                  <Settings className="h-5 w-5" />
                  <span>Admin</span>
                </button>
                
                {/* Bouton + intégré */}
                <MessageEditor />
              </div>
            </div>
            
            <MessageList messages={unassignedMessages} />
          </div>
        </main>
        
        {/* Footer simple */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-[75%] mx-auto px-4 py-4">
            <div className="text-sm text-gray-600 text-center">
              <strong className="text-gray-900">WholesaleXpress</strong> - Affichage d'équipe
            </div>
          </div>
        </footer>

        {/* Panneau Admin */}
        <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </div>
    </NotificationManager>
  );
}

export default App;