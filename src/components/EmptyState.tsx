import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-gray-100 rounded-full p-8 mb-8">
        <MessageSquare className="h-20 w-20 text-gray-400" />
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Aucun message pour le moment
      </h3>
      
      <p className="text-gray-600 mb-10 max-w-md text-lg">
        Commencez par créer votre premier message pour communiquer avec l'équipe. 
        Utilisez le bouton "Nouveau" pour ajouter un nouveau message.
      </p>
      
      <div className="flex items-center gap-3 text-blue-600">
        <Plus className="h-6 w-6" />
        <span className="font-medium">
          Cliquez sur "Nouveau" pour commencer
        </span>
      </div>
    </div>
  );
};

export default EmptyState;