import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Users, Calendar, Download, Filter, Search, CheckCircle, Clock, User } from 'lucide-react';
import { useMessageStore } from '../store/messageStore';
import { Message } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { messages, teamMembers, loadMessages, loadTeamMembers } = useMessageStore();
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('');

  // Charger les données quand le panneau s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadMessages();
      loadTeamMembers();
    }
  }, [isOpen, loadMessages, loadTeamMembers]);

  // Filtrer les messages selon les critères
  const filteredMessages = messages.filter(message => {
    // Filtre par statut d'assignation
    if (filter === 'assigned' && !message.assignedTo) return false;
    if (filter === 'unassigned' && message.assignedTo) return false;

    // Filtre par membre d'équipe
    if (selectedMember && message.assignedTo !== selectedMember) return false;

    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        message.title.toLowerCase().includes(searchLower) ||
        message.description.toLowerCase().includes(searchLower) ||
        (message.assignedTo && message.assignedTo.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Statistiques par membre
  const memberStats = teamMembers.map(member => {
    const assignedMessages = messages.filter(msg => msg.assignedTo === member.name);
    return {
      name: member.name,
      count: assignedMessages.length,
      messages: assignedMessages
    };
  }).sort((a, b) => b.count - a.count);

  // Exporter les données
  const exportData = () => {
    const data = filteredMessages.map(msg => ({
      'Titre': msg.title,
      'Description': msg.description,
      'Priorité': msg.priority,
      'Assigné à': msg.assignedTo || 'Non assigné',
      'Date d\'assignation': msg.assignedAt || 'N/A',
      'Date de création': msg.timestamp
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-assignations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityColors = {
    niveau1: 'bg-blue-100 text-blue-800',
    niveau2: 'bg-orange-100 text-orange-800',
    niveau3: 'bg-red-100 text-red-800'
  };

  const priorityLabels = {
    niveau1: 'Normal',
    niveau2: 'Important',
    niveau3: 'Urgent'
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold">Panneau d'Administration</Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1">Suivi des assignations et rapports</p>
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

          <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Messages assignés</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {messages.filter(m => m.assignedTo).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 rounded-lg p-2">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600">En attente</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {messages.filter(m => !m.assignedTo).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-lg p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Membres actifs</p>
                    <p className="text-2xl font-bold text-green-800">
                      {teamMembers.filter(m => m.active).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Total messages</p>
                    <p className="text-2xl font-bold text-purple-800">{messages.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques par membre */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance par membre</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {memberStats.map(stat => (
                  <div key={stat.name} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">{stat.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stat.count}</p>
                    <p className="text-xs text-gray-500">clients pris</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtres:</span>
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="all">Tous les messages</option>
                  <option value="assigned">Assignés uniquement</option>
                  <option value="unassigned">Non assignés</option>
                </select>

                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="">Tous les membres</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2 flex-grow max-w-xs">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow rounded-lg border border-gray-300 px-3 py-1 text-sm"
                  />
                </div>

                <button
                  onClick={exportData}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Exporter CSV
                </button>
              </div>
            </div>

            {/* Liste des messages */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Messages ({filteredMessages.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Message</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Priorité</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Assigné à</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Date assignation</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Créé le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs">
                              {message.title}
                            </p>
                            {message.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {message.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[message.priority]}`}>
                            {priorityLabels[message.priority]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {message.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {message.assignedTo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Non assigné</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {message.assignedAt || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {message.timestamp}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun message trouvé avec ces critères</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AdminPanel;