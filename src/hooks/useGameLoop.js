import { useEffect, useRef } from 'react';

const useGameLoop = (callback, dependencies = [], isPaused = false) => {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(0);

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current === 0) {
        previousTimeRef.current = time;
      }
      
      const deltaTime = time - previousTimeRef.current;
      previousTimeRef.current = time;
      
      if (!isPaused) {
        callback(deltaTime, time);
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, ...dependencies]);
};

export default useGameLoop;
