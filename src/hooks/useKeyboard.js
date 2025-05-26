import { useState, useEffect } from 'react';

const useKeyboard = (isPaused) => {
  // Track which keys are pressed
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
    ' ': false // Space for lightning super weapon
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      // Skip escape key - let Game component handle it exclusively
      if (key === 'escape') {
        console.log('🔵 useKeyboard: ESC key detected, skipping (letting Game handle it)');
        return;
      }
      
      // Handle space key even when paused (for lightning weapon)
      if (e.key === ' ') {
        console.log('🔵 useKeyboard: Space key pressed');
        setKeys(prev => ({ ...prev, ' ': true }));
        e.preventDefault();
        return;
      }
      
      // Don't process movement keys when paused
      if (isPaused) {
        console.log('🔵 useKeyboard: Key pressed but game is paused:', key);
        return;
      }
      
      // Update keys state
      if (key in keys) {
        console.log('🔵 useKeyboard: Processing movement key:', key);
        setKeys(prev => ({ ...prev, [key]: true }));
        
        // Prevent default actions for game keys
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      
      // Handle space key release even when paused
      if (e.key === ' ') {
        console.log('🔵 useKeyboard: Space key released');
        setKeys(prev => ({ ...prev, ' ': false }));
        return;
      }
      
      // Update keys state
      if (key in keys) {
        console.log('🔵 useKeyboard: Key released:', key);
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    console.log('🔵 useKeyboard: Adding event listeners');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      console.log('🔵 useKeyboard: Removing event listeners');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  return keys;
};

export default useKeyboard;
