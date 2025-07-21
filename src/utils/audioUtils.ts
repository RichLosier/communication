// Utilitaires audio pour les notifications
export const playMessageNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Son de notification distinctif - séquence de 3 tons
    const frequencies = [800, 1000, 1200]; // Tons ascendants
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Enveloppe sonore douce
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }, index * 200); // Délai entre chaque ton
    });
    
    // Ajouter un petit "ding" final pour marquer la fin
    setTimeout(() => {
      const finalOscillator = audioContext.createOscillator();
      const finalGain = audioContext.createGain();
      
      finalOscillator.connect(finalGain);
      finalGain.connect(audioContext.destination);
      
      finalOscillator.frequency.setValueAtTime(1400, audioContext.currentTime);
      finalOscillator.type = 'sine';
      
      finalGain.gain.setValueAtTime(0, audioContext.currentTime);
      finalGain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
      finalGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      finalOscillator.start(audioContext.currentTime);
      finalOscillator.stop(audioContext.currentTime + 0.3);
    }, 600);
    
  } catch (error) {
    // Fallback silencieux si l'audio ne fonctionne pas
    console.log('Audio notification non disponible');
  }
};

export const playUrgentMessageSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Son d'urgence - plus insistant pour les messages niveau 3
    const urgentPattern = [1000, 800, 1000, 800, 1200]; // Pattern d'alerte
    
    urgentPattern.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'square'; // Son plus percutant
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }, index * 150);
    });
    
  } catch (error) {
    console.log('Audio notification urgente non disponible');
  }
};

export const playBannerAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Son spécial pour les bannières prioritaires
    const alertFrequencies = [600, 900, 600, 900, 1100];
    
    alertFrequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);
      }, index * 180);
    });
    
  } catch (error) {
    console.log('Audio alerte bannière non disponible');
  }
};