import React, { useState, useEffect, useRef } from 'react';
import StartScreen from './UI/StartScreen';
import PauseOverlay from './UI/PauseOverlay';
import WaveInfo from './UI/WaveInfo';
import ScoreDisplay from './UI/ScoreDisplay';
import ReflectionDisplay from './UI/ReflectionDisplay';
import LightningCooldown from './UI/LightningCooldown';
import GameRenderer from './GameRenderer';
import useKeyboard from '../hooks/useKeyboard';
import usePointerLock from '../hooks/usePointerLock';
import useCursorStyle from '../hooks/useCursorStyle';
import useReflectionInput from '../hooks/useReflectionInput';
import useLightningWeapon from '../hooks/useLightningWeapon';
import { calculatePlayerMovement, calculateEnemyMovement, calculateBulletMovement } from '../utils/movement';
import { checkBulletEnemyCollisionWithRicochet } from '../utils/collision';
import { generateWaveEnemies } from '../utils/waves';
import { calculateLightningChain, applyLightningDamage } from '../utils/lightning';
import useGameSounds from '../hooks/useGameSounds';

const Game = () => {
  console.log('Game component rendered!');
  const canvasRef = useRef(null);
  
  // Game state with player and enemies
  const [player, setPlayer] = useState({
    x: 400,
    y: 300,
    size: 30,
    speed: 5
  });
  
  // Enemy state
  const [enemies, setEnemies] = useState([]);
  
  // Bullets state
  const [bullets, setBullets] = useState([]);
  
  // Mouse/trackpad absolute position on canvas
  const mousePosRef = useRef({ x: 400, y: 300 }); // Default center of canvas
  
  // Game pause state - start paused
  const [isPaused, setIsPaused] = useState(true);
  
  // Track if game has been started (pointer locked at least once)
  const [hasGameStarted, setHasGameStarted] = useState(false);
  
  // Wave system
  const [waveState, setWaveState] = useState({
    current: 1,
    enemiesGenerated: false,
    transitioning: false,
    complete: false,
    starting: false
  });
  
  // Score system
  const [score, setScore] = useState(0);

  // Use our custom hooks
  const keys = useKeyboard(isPaused);
  const isPointerLocked = usePointerLock(canvasRef, isPaused, setIsPaused);
  
  // Track when game starts (first time pointer gets locked)
  useEffect(() => {
    if (isPointerLocked && !hasGameStarted) {
      setHasGameStarted(true);
    }
  }, [isPointerLocked, hasGameStarted]);
  const reflectionCount = useReflectionInput(isPaused);
  const lightning = useLightningWeapon(isPaused);
  useCursorStyle();
  const { playShoot, playEnemyHit, playWalk } = useGameSounds();
  
  // Add ammoType state
  const [ammoType, setAmmoType] = useState(0);
  
  // Initialize first wave of enemies
  useEffect(() => {
    if (
      waveState.current === 1 &&
      !waveState.enemiesGenerated &&
      !isPaused &&
      isPointerLocked
    ) {
      console.log('Initializing wave 1 with fresh enemies');
      const initialEnemies = generateWaveEnemies(1, player);
      console.log(`Initial wave 1 created with ${initialEnemies.length} enemies`);
      setEnemies(initialEnemies);
      setWaveState(prev => ({ ...prev, enemiesGenerated: true }));
    }
  }, [isPaused, waveState.current, waveState.enemiesGenerated, player, isPointerLocked]);
  
  // Create a ref to store the current game state
  const gameStateRef = useRef({ player, mousePos: mousePosRef.current, wave: waveState.current });
  
  // Auto-shooting - fixed interval approach
  const lastShotTimeRef = useRef(0);
  
  // Add a state for the transition end time
  const [transitionEndTime, setTransitionEndTime] = useState(null);
  
  let lastPlayerPos = useRef({ x: 400, y: 300 });
  const lastWalkSoundTimeRef = useRef(0);
  
  // Handle shooting in the game loop instead of a separate interval
  const handleShooting = () => {
    if (isPaused || !isPointerLocked) {
      if (isPaused) console.log('🟡 Game: NOT SHOOTING - Game is paused');
      if (!isPointerLocked) console.log('🟡 Game: NOT SHOOTING - Pointer not locked');
      return;
    }
    const now = Date.now();
    if (now - lastShotTimeRef.current >= 200) { // 200ms between shots
      const centerX = player.x + player.size / 2;
      const centerY = player.y + player.size / 2;
      const currentMousePos = mousePosRef.current;
      const angle = Math.atan2(
        currentMousePos.y - centerY,
        currentMousePos.x - centerX
      );
      if (ammoType === 0) {
        // Rocket bullet: always create a bullet in the direction of the cursor
        setBullets(prev => [
          ...prev,
          {
            x: centerX,
            y: centerY,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            speed: 2.5,
            size: 8, // Increased from 5 to 8 for better hit detection
            color: reflectionCount > 0 ? '#EF4444' : '#F59E0B', // Red for reflection bullets
            type: 0,
            target: null, // Target will be set in the update loop
            reflectionsRemaining: reflectionCount,
            originalReflections: reflectionCount,
            hasHitTarget: false,
            lastHitEnemy: null
          }
        ]);
      } else if (ammoType === 1) {
        // Line bullet
        setBullets(prev => [
          ...prev,
          {
            x: centerX,
            y: centerY,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            speed: 10,
            size: 20,
            color: reflectionCount > 0 ? '#EF4444' : '#F59E0B', // Red for reflection bullets
            type: 1,
            reflectionsRemaining: reflectionCount,
            originalReflections: reflectionCount,
            hasHitTarget: false,
            lastHitEnemy: null
          }
        ]);
      }
      playShoot();
      lastShotTimeRef.current = now;
    }
  };

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isPointerLocked) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Handle mouse movement differently when pointer is locked
      if (document.pointerLockElement === canvas || 
          document.mozPointerLockElement === canvas ||
          document.webkitPointerLockElement === canvas) {
        
        // Update ref directly for smoother tracking
        let newX = mousePosRef.current.x + e.movementX;
        let newY = mousePosRef.current.y + e.movementY;
        
        // Clamp to canvas boundaries
        newX = Math.max(0, Math.min(canvas.width, newX));
        newY = Math.max(0, Math.min(canvas.height, newY));
        
        // Update ref immediately
        mousePosRef.current = { x: newX, y: newY };
      } else {
        // Fallback to absolute positioning when not locked
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update ref
        mousePosRef.current = { x, y };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPointerLocked]);

  // Track isPaused state changes
  useEffect(() => {
    console.log('🔴 Game: isPaused state changed to:', isPaused);
  }, [isPaused]);

  // Track ESC presses for potential browser closing
  const escPressCountRef = useRef(0);
  const escPressTimeoutRef = useRef(null);

  // Handle escape key for pause and potential browser closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        console.log('🔴 ESC KEY PRESSED!');
        console.log('Current game state:');
        console.log('  - isPaused:', isPaused);
        console.log('  - isPointerLocked:', isPointerLocked);
        console.log('  - hasGameStarted:', hasGameStarted);
        console.log('  - enemiesGenerated:', waveState.enemiesGenerated);
        console.log('  - pointer lock element:', document.pointerLockElement);
        
        // ESC only pauses, never unpauses (click will unpause)
        if (!isPaused) {
          console.log('⏸️ PAUSING GAME with ESC');
          setIsPaused(true);
          document.exitPointerLock();
          escPressCountRef.current = 1; // First ESC press
          console.log('🔴 ESC COUNT: 1 (game paused)');
        } else {
          // Game is already paused, this is a subsequent ESC press
          escPressCountRef.current += 1;
          console.log('🔴 ESC COUNT:', escPressCountRef.current, '(game already paused)');
          
          // Clear any existing timeout
          if (escPressTimeoutRef.current) {
            clearTimeout(escPressTimeoutRef.current);
          }
          
          if (escPressCountRef.current === 2) {
            console.log('🚪🚪 DOUBLE ESC DETECTED - REQUESTING BROWSER CLOSE 🚪🚪');
            console.log('BROWSER_CLOSE_REQUEST: Double ESC pressed while paused');
            
            // Try multiple methods to signal browser close
            // Method 1: Console message that Playwright can detect
            console.warn('PLAYWRIGHT_CLOSE_SIGNAL: Double ESC pressed');
            
            // Method 2: Try to close window directly (may work in some contexts)
            try {
              window.close();
              console.log('💡 Attempted window.close()');
            } catch (error) {
              console.log('💡 window.close() failed:', error.message);
            }
            
            // Method 3: Send custom event that could be detected
            window.dispatchEvent(new CustomEvent('doubleEscapePressed', { 
              detail: { timestamp: Date.now(), message: 'User pressed ESC twice while paused' }
            }));
            
            // Method 4: Try to trigger beforeunload (may prompt user)
            try {
              window.dispatchEvent(new Event('beforeunload'));
              console.log('💡 Dispatched beforeunload event');
            } catch (error) {
              console.log('💡 beforeunload dispatch failed:', error.message);
            }
            
            // Reset count after double ESC
            escPressCountRef.current = 0;
          } else if (escPressCountRef.current > 2) {
            console.log('🚪 MULTIPLE ESC PRESSES - RESET COUNT');
            escPressCountRef.current = 0;
          }
          
          // Reset count after 3 seconds if no additional ESC presses
          escPressTimeoutRef.current = setTimeout(() => {
            if (escPressCountRef.current > 0) {
              console.log('🔄 ESC count reset due to timeout');
              escPressCountRef.current = 0;
            }
          }, 3000);
        }
        
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Use capture phase to ensure we get the event first
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      // Clear timeout on cleanup
      if (escPressTimeoutRef.current) {
        clearTimeout(escPressTimeoutRef.current);
      }
    };
  }, [isPaused, isPointerLocked, hasGameStarted, waveState.enemiesGenerated]);

  // Update game state ref
  useEffect(() => {
    gameStateRef.current = { player, mousePos: mousePosRef.current, wave: waveState.current };
  }, [player, mousePosRef.current, waveState]);
  
  // Update the ref when the state changes
  useEffect(() => {
    // Update game state ref
    gameStateRef.current = { mousePos: mousePosRef.current, player, wave: waveState.current };
  }, [mousePosRef.current, player, waveState]);

  // Track space key press for lightning weapon
  const spaceKeyPressed = useRef(false);
  
  // Debug: Log keyboard state changes
  useEffect(() => {
    console.log('Keys state changed:', keys);
  }, [keys]);
  
  // Handle lightning weapon activation using existing keyboard state
  useEffect(() => {
    console.log('Lightning effect triggered, keys space:', keys[' '], 'spacePressed:', spaceKeyPressed.current, 'isPaused:', isPaused, 'canActivate:', lightning.canActivate());
    // Lightning does NOT work when paused - only when game is active
    if (keys[' '] && !spaceKeyPressed.current && !isPaused && lightning.canActivate()) {
      console.log('Lightning activation triggered via keyboard state!');
      spaceKeyPressed.current = true;
      
      const lightningChain = calculateLightningChain(player, enemies);
      console.log('Lightning chain calculated:', lightningChain);
      if (lightningChain.length > 0) {
        const hitEnemies = applyLightningDamage(lightningChain);
        lightning.activate(lightningChain);
        console.log('Lightning activated, hit enemies:', hitEnemies);
        
        // Apply damage to enemies
        setEnemies(prevEnemies => {
          return prevEnemies.map(enemy => {
            const hitData = hitEnemies.find(hit => hit.enemy === enemy);
            if (hitData) {
              const currentHealth = typeof enemy.health === 'number' ? enemy.health : 2;
              const newHealth = currentHealth - hitData.damage;
              if (newHealth <= 0) {
                setScore(prev => prev + (enemy.points || 100));
                return null; // Mark for removal
              }
              return { ...enemy, health: newHealth };
            }
            return enemy;
          }).filter(enemy => enemy !== null);
        });
        
        playEnemyHit(); // Lightning sound effect
      } else {
        console.log('No lightning chain possible - no enemies in range');
      }
    }
    
    // Reset space key tracking when key is released
    if (!keys[' ']) {
      spaceKeyPressed.current = false;
    }
  }, [keys, isPaused, lightning, player, enemies, playEnemyHit]);

  // Game loop for updating positions
  useEffect(() => {
    console.log('🟢 Game: Game loop effect triggered. isPaused:', isPaused, 'enemiesGenerated:', waveState.enemiesGenerated);
    
    if (isPaused || !waveState.enemiesGenerated) {
      console.log('🟢 Game: Game loop not starting - isPaused:', isPaused, 'enemiesGenerated:', waveState.enemiesGenerated);
      return;
    }
    
    console.log('🟢 Game: Starting game loop');
    const gameLoop = () => {
      
      setPlayer(prev => {
        const newPosition = calculatePlayerMovement(prev, keys);
        // Play walk sound if player moved, but only every 200ms
        if (newPosition.x !== lastPlayerPos.current.x || newPosition.y !== lastPlayerPos.current.y) {
          const now = Date.now();
          if (now - lastWalkSoundTimeRef.current > 200) {
            playWalk();
            lastWalkSoundTimeRef.current = now;
          }
        }
        lastPlayerPos.current = newPosition;
        return { ...prev, ...newPosition };
      });
      // Store the updated enemies outside the nested function
      let finalEnemies = null;
      
      setEnemies(prevEnemies => {
        const movedEnemies = prevEnemies.map(enemy => {
          const newPosition = calculateEnemyMovement(enemy, player);
          return { ...enemy, ...newPosition };
        });
        setBullets(prevBullets => {
          const movedBullets = prevBullets
            .map(bullet => {
              let newPosition = calculateBulletMovement(bullet);
              if (bullet.type === 0) {
                // Rocket bullet: find new target if current one is destroyed or no target exists
                let target = bullet.target;
                if (!target || !enemies.includes(target)) {
                  // Find nearest enemy in front of the rocket
                  let nearestEnemy = null;
                  let minDistance = Infinity;
                  const bulletAngle = Math.atan2(bullet.dy, bullet.dx);
                  enemies.forEach(enemy => {
                    const dx = enemy.x - bullet.x;
                    const dy = enemy.y - bullet.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angleToEnemy = Math.atan2(dy, dx);
                    const angleDiff = Math.abs(angleToEnemy - bulletAngle);
                    // Only consider enemies within a 90-degree cone in front of the rocket
                    if (angleDiff < Math.PI/2 && distance < minDistance) {
                      minDistance = distance;
                      nearestEnemy = enemy;
                    }
                  });
                  target = nearestEnemy;
                }
                if (target) {
                  // Gradually turn toward target
                  const targetAngle = Math.atan2(
                    target.y - bullet.y,
                    target.x - bullet.x
                  );
                  const currentAngle = Math.atan2(bullet.dy, bullet.dx);
                  const turnRate = 0.1; // Limited turning radius
                  const newAngle = currentAngle + (targetAngle - currentAngle) * turnRate;
                  newPosition = {
                    ...newPosition,
                    dx: Math.cos(newAngle),
                    dy: Math.sin(newAngle),
                    target: target
                  };
                } else {
                  // No target, continue in current direction
                  newPosition = {
                    ...newPosition,
                    target: null
                  };
                }
              }
              return { ...bullet, ...newPosition };
            })
            .filter(bullet => bullet.x >= 0 && bullet.x <= 800 && bullet.y >= 0 && bullet.y <= 600);
          const updatedEnemies = [...movedEnemies];
          const bulletsToKeep = [];
          movedBullets.forEach(bullet => {
            const collisionResult = checkBulletEnemyCollisionWithRicochet(bullet, updatedEnemies);
            const { hitIndex, shouldRemoveBullet, updatedBullet } = collisionResult;
            
            if (hitIndex !== -1 && updatedEnemies[hitIndex]) {
              const enemy = updatedEnemies[hitIndex];
              const currentHealth = typeof enemy.health === 'number' ? enemy.health : 2;
              const updatedHealth = currentHealth - 1;
              playEnemyHit();
              if (updatedHealth <= 0) {
                setScore(prev => prev + (enemy.points || 100));
                updatedEnemies.splice(hitIndex, 1);
              } else {
                updatedEnemies[hitIndex] = { ...enemy, health: updatedHealth };
              }
              
              // Keep bullet if it's ricocheting
              if (!shouldRemoveBullet) {
                bulletsToKeep.push(updatedBullet);
              }
            } else {
              bulletsToKeep.push(bullet);
            }
          });
          // Store the updated enemies for the outer function
          finalEnemies = updatedEnemies;
          return bulletsToKeep;
        });
        // Return the updated enemies that includes health changes
        return finalEnemies;
      });
      handleShooting();
    };
    const gameLoopInterval = setInterval(gameLoop, 16);
    console.log('🟢 Game: Game loop interval created:', gameLoopInterval);
    
    return () => {
      console.log('🟢 Game: Clearing game loop interval:', gameLoopInterval);
      clearInterval(gameLoopInterval);
    };
  }, [isPaused, isPointerLocked, player, waveState, keys]);

  // Add CSS to hide cursor
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .game-container {
        cursor: none !important;
      }
      .game-container canvas {
        cursor: none !important;
      }
      body {
        overflow: hidden; /* Prevent scrolling */
      }
    `;
    // Add it to the head
    document.head.appendChild(style);

    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Track wave completion - separate from other game logic
  useEffect(() => {
    // Skip checks during transitions or when paused or pointer not locked
    if (isPaused || !isPointerLocked || waveState.complete || waveState.starting || !waveState.enemiesGenerated)
      return;

    // Debug enemies state only when enemies are low
    if (enemies.length <= 3) {
      console.log(`WAVE CHECK: ${enemies.length} enemies in wave ${waveState.current}`);
    }
    
    // Check if all enemies are defeated
    if (enemies.length === 0) {
      console.log(`✅✅ WAVE ${waveState.current} COMPLETE! ✅✅`);
      setWaveState(prev => ({ ...prev, complete: true }));
    }
  }, [isPaused, isPointerLocked, enemies.length, waveState]);
  
  // Handle wave transitions (just the state, not enemy generation)
  useEffect(() => {
    if (isPaused) return;
    if (waveState.complete && !waveState.transitioning) {
      setWaveState(state => ({
        ...state,
        transitioning: true
      }));
      setTransitionEndTime(Date.now() + 333); // 3x faster
    }
  }, [isPaused, waveState.complete, waveState.transitioning]);

  // Poll for transition end
  useEffect(() => {
    if (!waveState.transitioning || !transitionEndTime) return;
    const interval = setInterval(() => {
      if (Date.now() >= transitionEndTime) {
        const nextWave = waveState.current + 1;
        setWaveState(state => ({
          ...state,
          current: nextWave,
          enemiesGenerated: false,
          transitioning: false,
          complete: false,
          starting: true
        }));
        setTransitionEndTime(null);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [waveState.transitioning, transitionEndTime]);

  // Handle enemy generation for new wave (separate effect, always uses latest waveState.current)
  useEffect(() => {
    if (isPaused) return;
    if (waveState.starting && !waveState.enemiesGenerated) {
      const newEnemies = generateWaveEnemies(waveState.current, player);
      setEnemies(newEnemies);
      const timer = setTimeout(() => {
        setWaveState(state => ({
          ...state,
          enemiesGenerated: true,
          starting: false
        }));
      }, 333); // 3x faster
      return () => clearTimeout(timer);
    }
  }, [isPaused, waveState.starting, waveState.enemiesGenerated, waveState.current]);
  
  // Debug enemies state periodically - but less frequently to reduce noise
  useEffect(() => {
    if (isPaused) return;
    
    const debugInterval = setInterval(() => {
      if (!waveState.complete && !waveState.starting && waveState.enemiesGenerated) {
        console.log(`Wave ${waveState.current} status: ${enemies.length} enemies remaining`);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(debugInterval);
  }, [isPaused, enemies.length, waveState]);

  // Add mouse click handler to toggle ammoType
  useEffect(() => {
    const handleMouseClick = () => {
      if (isPointerLocked) {
        setAmmoType(prev => (prev === 0 ? 1 : 0));
      }
    };
    window.addEventListener('click', handleMouseClick);
    return () => {
      window.removeEventListener('click', handleMouseClick);
    };
  }, [isPointerLocked]);

  return (
    <div className="game-container" style={{ cursor: 'none' }}>
      {/* Only show start message when game hasn't started yet */}
      <StartScreen hasGameStarted={hasGameStarted} isPaused={isPaused} />
      
      {/* Only show pause message when game has started and is paused */}
      <PauseOverlay hasGameStarted={hasGameStarted} isPaused={isPaused} />
      
      {/* Wave information */}
      <WaveInfo 
        wave={waveState.current} 
        isWaveComplete={waveState.complete} 
        isPaused={isPaused} 
      />
      
      {/* Score display */}
      <ScoreDisplay score={score} />
      
      {/* Reflection display */}
      <ReflectionDisplay reflectionCount={reflectionCount} />
      
      {/* Lightning weapon cooldown */}
      <LightningCooldown 
        isOnCooldown={lightning.isOnCooldown} 
        cooldownPercentage={lightning.cooldownPercentage}
      />
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ 
          background: '#1F2937', 
          display: 'block', 
          margin: '0 auto',
          cursor: 'none',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Game renderer */}
      <GameRenderer
        canvasRef={canvasRef}
        player={player}
        enemies={enemies}
        bullets={bullets}
        mousePosRef={mousePosRef}
        waveState={waveState}
        activeLightning={lightning.activeLightning}
      />
    </div>
  );
};

export default Game;
