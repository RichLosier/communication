import React, { useState, useEffect } from 'react';

const LastUpdate: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    
    return () => clearInterval(updateInterval);
  }, []);
  
  const formatLastUpdate = (date: Date) => {
    return `Dernière mise à jour: ${date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  };
  
  return (
    <div className="text-sm text-gray-500 border-r border-gray-300 pr-6">{formatLastUpdate(lastUpdate)}</div>
  );
};

export default LastUpdate;