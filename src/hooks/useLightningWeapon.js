import { useState, useRef, useEffect } from 'react';

const useLightningWeapon = (isPaused) => {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [activeLightning, setActiveLightning] = useState([]);
  const lastActivationTime = useRef(0);
  
  const COOLDOWN_TIME = 4000; // 4 seconds in milliseconds
  const LIGHTNING_DURATION = 500; // 0.5 seconds
  
  // Update cooldown timer
  useEffect(() => {
    if (!isOnCooldown) return;
    
    const interval = setInterval(() => {
      const timeLeft = Math.max(0, COOLDOWN_TIME - (Date.now() - lastActivationTime.current));
      setCooldownTimeLeft(timeLeft);
      
      if (timeLeft === 0) {
        setIsOnCooldown(false);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isOnCooldown]);
  
  // Clear active lightning after duration
  useEffect(() => {
    if (activeLightning.length === 0) return;
    
    const timeout = setTimeout(() => {
      setActiveLightning([]);
    }, LIGHTNING_DURATION);
    
    return () => clearTimeout(timeout);
  }, [activeLightning]);
  
  const canActivate = () => {
    // Lightning weapon works even when paused, only blocked by cooldown
    const result = !isOnCooldown;
    return result;
  };
  
  const activate = (lightningChain) => {
    if (!canActivate()) return false;
    
    lastActivationTime.current = Date.now();
    setIsOnCooldown(true);
    setCooldownTimeLeft(COOLDOWN_TIME);
    setActiveLightning(lightningChain);
    
    return true;
  };
  
  return {
    canActivate,
    activate,
    isOnCooldown,
    cooldownTimeLeft,
    activeLightning,
    cooldownPercentage: isOnCooldown ? (cooldownTimeLeft / COOLDOWN_TIME) * 100 : 0
  };
};

export default useLightningWeapon;
