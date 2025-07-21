import React, { useState, useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import { PriorityAlert } from '../types';

interface PriorityBannerProps {
  alert: PriorityAlert;
}

const PriorityBanner: React.FC<PriorityBannerProps> = ({ alert }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (!alert.active) return;
    setIsVisible(true);
  }, [alert]);
  
  if (!alert.active || !isVisible) return null;

  const bgColor = alert.color === 'red' 
    ? 'from-red-600 to-red-500'
    : 'from-green-600 to-green-500';
  
  return (
    <div className={`w-full bg-gradient-to-r ${bgColor} text-white py-3 px-6 flex items-center justify-between animate-fadeIn`}>
      <div className="flex items-center space-x-3">
        <AlertOctagon className="h-6 w-6 animate-pulse" />
        <span className="text-xl font-semibold">{alert.message}</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-white hover:text-gray-200 focus:outline-none"
        aria-label="Fermer"
      >
        <span className="text-2xl">&times;</span>
      </button>
    </div>
  );
};

export default PriorityBanner;