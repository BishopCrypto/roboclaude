import { useState, useEffect } from 'react';

const useReflectionInput = (isPaused) => {
  const [reflectionCount, setReflectionCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't process when paused
      if (isPaused) return;
      
      // Check for number keys 1-9
      const key = e.key;
      if (key >= '1' && key <= '9') {
        const count = parseInt(key);
        setReflectionCount(count);
        e.preventDefault();
      } else if (key === '0') {
        // 0 resets to no reflections
        setReflectionCount(0);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused]);

  return reflectionCount;
};

export default useReflectionInput;
