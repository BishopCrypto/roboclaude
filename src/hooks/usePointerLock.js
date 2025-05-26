import { useState, useEffect } from 'react';

const usePointerLock = (canvasRef, isPaused, setIsPaused) => {
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  // Track if we're handling an Escape key event to prevent immediate re-locking
  const [isHandlingEscape, setIsHandlingEscape] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Request pointer lock when canvas is clicked
    const handleCanvasClick = () => {
      // If paused, unpause the game
      if (isPaused) {
        setIsPaused(false);
        console.log('Game unpaused via click');
      }
      
      // Request pointer lock if not already locked and not handling an escape key event
      if (!isPointerLocked && !isHandlingEscape) {
        canvas.requestPointerLock = canvas.requestPointerLock || 
                                  canvas.mozRequestPointerLock ||
                                  canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
      }
    };
    
    // Handle pointer lock change (use single handler to avoid duplicates)
    const pointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas || 
                      document.mozPointerLockElement === canvas ||
                      document.webkitPointerLockElement === canvas;
                      
      console.log('🟠 usePointerLock: Pointer lock change detected. isLocked:', isLocked, 'previous isPointerLocked:', isPointerLocked);
                      
      if (isLocked !== isPointerLocked) {
        if (isLocked) {
          console.log('🟠 usePointerLock: Pointer locked to canvas');
          setIsPointerLocked(true);
        } else {
          console.log('🟠 usePointerLock: Pointer lock released. isPaused:', isPaused);
          setIsPointerLocked(false);
          
          // AUTO-PAUSE: When pointer lock is released (usually by ESC key), pause the game
          if (!isPaused) {
            console.log('🟠 usePointerLock: Auto-pausing game due to pointer lock release');
            setIsPaused(true);
            setIsHandlingEscape(true);
            // Reset after a short delay to allow for normal pointer lock behavior again
            setTimeout(() => {
              console.log('🟠 usePointerLock: Resetting isHandlingEscape to false');
              setIsHandlingEscape(false);
            }, 500);
          }
        }
      }
    };
    
    // Handle pointer lock error
    const pointerLockError = () => {
      console.error('Error locking pointer');
    };
    
    // Add event listeners
    canvas.addEventListener('click', handleCanvasClick);
    document.addEventListener('pointerlockchange', pointerLockChange);
    document.addEventListener('mozpointerlockchange', pointerLockChange);
    document.addEventListener('webkitpointerlockchange', pointerLockChange);
    document.addEventListener('pointerlockerror', pointerLockError);
    document.addEventListener('mozpointerlockerror', pointerLockError);
    document.addEventListener('webkitpointerlockerror', pointerLockError);
    
    // Clean up
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('pointerlockchange', pointerLockChange);
      document.removeEventListener('mozpointerlockchange', pointerLockChange);
      document.removeEventListener('webkitpointerlockchange', pointerLockChange);
      document.removeEventListener('pointerlockerror', pointerLockError);
      document.removeEventListener('mozpointerlockerror', pointerLockError);
      document.removeEventListener('webkitpointerlockerror', pointerLockError);
    };
  }, [canvasRef, isPaused, isPointerLocked, isHandlingEscape, setIsPaused]);

  return isPointerLocked;
};

export default usePointerLock;
