import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);
  
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    };
    return date.toLocaleDateString('fr-FR', options);
  };
  
  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-gray-900">{formatTime(time)}</div>
      <div className="text-sm text-gray-600">{formatDate(time)}</div>
    </div>
  );
};

export default DigitalClock;