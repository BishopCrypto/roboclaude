import { useState, useEffect, useCallback } from 'react';

const usePointerLock = (canvasRef) => {
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Request pointer lock
  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!isPointerLocked) {
      canvas.requestPointerLock = canvas.requestPointerLock || 
                                canvas.mozRequestPointerLock ||
                                canvas.webkitRequestPointerLock;
      canvas.requestPointerLock();
    }
  }, [canvasRef, isPointerLocked]);

  // Exit pointer lock
  const exitPointerLock = useCallback(() => {
    if (isPointerLocked) {
      document.exitPointerLock = document.exitPointerLock ||
                                 document.mozExitPointerLock ||
                                 document.webkitExitPointerLock;
      document.exitPointerLock();
    }
  }, [isPointerLocked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle pointer lock change
    const pointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas || 
                      document.mozPointerLockElement === canvas ||
                      document.webkitPointerLockElement === canvas;
                      
      console.log('🟠 usePointerLock: Pointer lock change detected. isLocked:', isLocked);
      setIsPointerLocked(isLocked);
    };
    
    // Handle pointer lock error
    const pointerLockError = () => {
      console.error('Error locking pointer');
    };
    
    // Add event listeners
    document.addEventListener('pointerlockchange', pointerLockChange);
    document.addEventListener('mozpointerlockchange', pointerLockChange);
    document.addEventListener('webkitpointerlockchange', pointerLockChange);
    document.addEventListener('pointerlockerror', pointerLockError);
    document.addEventListener('mozpointerlockerror', pointerLockError);
    document.addEventListener('webkitpointerlockerror', pointerLockError);
    
    // Clean up
    return () => {
      document.removeEventListener('pointerlockchange', pointerLockChange);
      document.removeEventListener('mozpointerlockchange', pointerLockChange);
      document.removeEventListener('webkitpointerlockchange', pointerLockChange);
      document.removeEventListener('pointerlockerror', pointerLockError);
      document.removeEventListener('mozpointerlockerror', pointerLockError);
      document.removeEventListener('webkitpointerlockerror', pointerLockError);
    };
  }, [canvasRef]);

  return { isPointerLocked, requestPointerLock, exitPointerLock };
};

export default usePointerLock;