import React, { useState, useEffect, useRef } from 'react';
import GameRenderer from './GameRenderer';
import StartScreen from './UI/StartScreen';
import PauseOverlay from './UI/PauseOverlay';
import WaveInfo from './UI/WaveInfo';
import ScoreDisplay from './UI/ScoreDisplay';
import LightningCooldown from './UI/LightningCooldown';
import ReflectionDisplay from './UI/ReflectionDisplay';
import WeaponDisplay from './UI/WeaponDisplay';
import useKeyboard from '../hooks/useKeyboard';
import usePointerLock from '../hooks/usePointerLock';
import useGameSounds from '../hooks/useGameSounds';
import useLightningWeapon from '../hooks/useLightningWeapon';
import useReflectionInput from '../hooks/useReflectionInput';
import useWeaponSystem from '../hooks/useWeaponSystem';
import { calculateLightningChain, applyLightningDamage } from '../utils/lightning';
import GameLoop from '../systems/GameLoop';
import WaveManager from '../managers/WaveManager';

const Game = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const waveManagerRef = useRef(null);
  const mousePosRef = useRef({ x: 400, y: 300 });
  
  // Game state
  const [player, setPlayer] = useState({ x: 400, y: 300, size: 20, speed: 5 });
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveState, setWaveState] = useState({
    current: 1,
    complete: false,
    transitioning: false,
    enemiesGenerated: false,
    starting: false
  });
  const [isPaused, setIsPaused] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [transitionEndTime, setTransitionEndTime] = useState(null);
  
  // Custom hooks
  const keys = useKeyboard(isPaused);
  const { isPointerLocked, requestPointerLock, exitPointerLock } = usePointerLock(canvasRef);
  const { playShoot, playEnemyHit, playWalk } = useGameSounds();
  const lightning = useLightningWeapon();
  const bulletReflections = useReflectionInput();
  const { currentWeapon, weaponName, WEAPON_TYPES } = useWeaponSystem();
  
  // Track space key for lightning
  const spaceKeyPressed = useRef(false);
  const lastWalkSoundTimeRef = useRef(0);
  const bulletReflectionsRef = useRef(bulletReflections);
  const playShootRef = useRef(playShoot);
  const playEnemyHitRef = useRef(playEnemyHit);
  const currentWeaponRef = useRef(currentWeapon);
  
  // Update refs
  useEffect(() => {
    bulletReflectionsRef.current = bulletReflections;
    playShootRef.current = playShoot;
    playEnemyHitRef.current = playEnemyHit;
    currentWeaponRef.current = currentWeapon;
  }, [bulletReflections, playShoot, playEnemyHit, currentWeapon]);
  
  // Initialize game systems
  useEffect(() => {
    // Create game loop
    gameLoopRef.current = new GameLoop();
    
    // Create wave manager
    waveManagerRef.current = new WaveManager();
    
    // Set up callbacks
    gameLoopRef.current.setCallbacks({
      onShoot: (player, mousePos) => {
        playShootRef.current();
        
        const weapon = currentWeaponRef.current;
        const angle = Math.atan2(
          mousePos.y - (player.y + player.size / 2),
          mousePos.x - (player.x + player.size / 2)
        );
        
        // Base bullet properties
        const baseBullet = {
          x: player.x + player.size / 2 - 2.5,
          y: player.y + player.size / 2 - 2.5,
          dx: Math.cos(angle),
          dy: Math.sin(angle),
          size: 5,
          speed: 10,
          damage: 1,
          reflectionsRemaining: bulletReflectionsRef.current
        };
        
        // Create bullets based on weapon type
        switch (weapon) {
          case 0: // Standard
            return {
              ...baseBullet,
              type: 0,
              color: '#FBBF24'
            };
            
          case 1: // Homing
            return {
              ...baseBullet,
              type: 0, // Rocket type for homing
              color: '#FF6B6B',
              speed: 8 // Slightly slower for homing
            };
            
          case 2: // Spread (return array for multiple bullets)
            const spreadAngle = 0.2; // radians
            return [
              { ...baseBullet, type: 1, color: '#4ECDC4', size: 8, dx: Math.cos(angle - spreadAngle), dy: Math.sin(angle - spreadAngle) },
              { ...baseBullet, type: 1, color: '#4ECDC4', size: 8 },
              { ...baseBullet, type: 1, color: '#4ECDC4', size: 8, dx: Math.cos(angle + spreadAngle), dy: Math.sin(angle + spreadAngle) }
            ];
            
          case 3: // Laser
            return {
              ...baseBullet,
              type: 1,
              color: '#E94560',
              speed: 20,
              damage: 2,
              size: 15,  // Thicker
              length: 30 // Custom property for laser length
            };
            
          default:
            return baseBullet;
        }
      },
      
      onEnemyHit: (result) => {
        playEnemyHitRef.current();
      },
      
      onStateUpdate: (state) => {
        console.log('🎮 Game: State update received - enemies:', state.enemies.length, 'player:', state.player.x, state.player.y);
        setPlayer(state.player);
        setEnemies(state.enemies);
        setBullets(state.bullets);
        setScore(state.score);
      },
      
      onWaveComplete: (waveNum) => {
        waveManagerRef.current.completeWave();
      }
    });
    
    // Set up wave manager callbacks
    waveManagerRef.current.setCallbacks({
      onWaveStart: (waveNum, enemies) => {
        console.log(`Wave ${waveNum} started with ${enemies.length} enemies`);
      },
      
      onWaveComplete: (waveNum) => {
        console.log(`Wave ${waveNum} complete!`);
        setWaveState(prev => ({ ...prev, complete: true }));
      },
      
      onTransitionStart: (waveNum) => {
        console.log(`Transitioning from wave ${waveNum}`);
        setWaveState(prev => ({ ...prev, transitioning: true }));
        setTransitionEndTime(Date.now() + 1000);
      },
      
      onTransitionEnd: (newWaveNum) => {
        console.log(`Starting wave ${newWaveNum}`);
        setWave(newWaveNum);
        setWaveState({
          current: newWaveNum,
          complete: false,
          transitioning: false,
          enemiesGenerated: false,
          starting: false
        });
      }
    });
    
    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.destroy();
      }
    };
  }, []); // Remove dependencies to ensure game systems are only created once
  
  // Handle game start
  const handleStart = () => {
    requestPointerLock();
    setHasGameStarted(true);
    setIsPaused(false);
  };
  
  // Handle game pause
  const handlePause = () => {
    setIsPaused(false);
    requestPointerLock();
  };
  
  // Update game loop with current state
  useEffect(() => {
    if (gameLoopRef.current) {
      console.log('🎮 Game: Updating game loop - keys:', keys, 'isPaused:', isPaused);
      gameLoopRef.current.setPlayerInput(keys);
      gameLoopRef.current.setMousePosition(mousePosRef.current);
      gameLoopRef.current.setPointerLocked(isPointerLocked);
      gameLoopRef.current.setPaused(isPaused);
    } else {
      console.log('🔴 Game: GameLoop not initialized yet');
    }
  }, [keys, isPointerLocked, isPaused]);
  
  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPointerLocked) {
        mousePosRef.current.x = Math.max(0, Math.min(800, mousePosRef.current.x + e.movementX));
        mousePosRef.current.y = Math.max(0, Math.min(600, mousePosRef.current.y + e.movementY));
      } else {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          mousePosRef.current.x = e.clientX - rect.left;
          mousePosRef.current.y = e.clientY - rect.top;
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerLocked]);
  
  // Handle ESC key for pause - simplified
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && hasGameStarted) {
        if (!isPaused) {
          setIsPaused(true);
          // Don't call exitPointerLock here - let the browser handle it
        }
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, hasGameStarted]);
  
  // Handle lightning weapon
  useEffect(() => {
    if (keys[' '] && !spaceKeyPressed.current && !isPaused && lightning.canActivate()) {
      spaceKeyPressed.current = true;
      
      const lightningChain = calculateLightningChain(player, enemies);
      console.log('⚡ Lightning activated - chain length:', lightningChain.length);
      
      if (lightningChain.length > 0) {
        const hitResults = applyLightningDamage(lightningChain);
        lightning.activate(lightningChain);
        
        // Process lightning damage through game loop
        if (gameLoopRef.current) {
          console.log('⚡ Processing lightning damage for', lightningChain.length, 'enemies');
          const results = gameLoopRef.current.processLightning(lightningChain);
          console.log('⚡ Lightning damage results:', results);
        }
        
        playEnemyHit();
      } else {
        console.log('⚡ No enemies in lightning range');
      }
    }
    
    if (!keys[' ']) {
      spaceKeyPressed.current = false;
    }
  }, [keys, isPaused, lightning, player, enemies, playEnemyHit]);
  
  // Initialize first wave
  useEffect(() => {
    console.log('🎮 Game: Wave init check - hasGameStarted:', hasGameStarted, 'isPaused:', isPaused, 'isPointerLocked:', isPointerLocked, 'enemiesGenerated:', waveState.enemiesGenerated);
    
    if (hasGameStarted && !isPaused && isPointerLocked && !waveState.enemiesGenerated) {
      const waveManager = waveManagerRef.current;
      const gameLoop = gameLoopRef.current;
      
      console.log('🎮 Game: Initializing first wave');
      
      if (waveManager && gameLoop) {
        const newEnemies = waveManager.generateEnemies(player);
        if (newEnemies) {
          console.log('🎮 Game: Generated', newEnemies.length, 'enemies');
          gameLoop.init({
            player,
            enemies: newEnemies,
            bullets: [],
            score: 0,
            wave: 1
          });
          gameLoop.start();
          setEnemies(newEnemies);
          setWaveState(prev => ({ ...prev, enemiesGenerated: true }));
        }
      }
    }
  }, [hasGameStarted, isPaused, isPointerLocked, waveState.enemiesGenerated, player]);
  
  // Handle wave transitions
  useEffect(() => {
    if (waveState.complete && !waveState.transitioning) {
      waveManagerRef.current?.startTransition();
    }
  }, [waveState.complete, waveState.transitioning]);
  
  // Check transition completion
  useEffect(() => {
    if (waveState.transitioning && transitionEndTime) {
      const checkTransition = setInterval(() => {
        if (Date.now() >= transitionEndTime) {
          waveManagerRef.current?.checkTransition();
          clearInterval(checkTransition);
        }
      }, 100);
      
      return () => clearInterval(checkTransition);
    }
  }, [waveState.transitioning, transitionEndTime]);
  
  // Generate new wave enemies after transition
  useEffect(() => {
    if (!waveState.transitioning && !waveState.enemiesGenerated && waveState.current > 1) {
      const waveManager = waveManagerRef.current;
      const gameLoop = gameLoopRef.current;
      
      if (waveManager && gameLoop) {
        const newEnemies = waveManager.generateEnemies(player);
        if (newEnemies) {
          gameLoop.addEnemies(newEnemies);
          setEnemies(newEnemies);
          setWaveState(prev => ({ ...prev, enemiesGenerated: true }));
        }
      }
    }
  }, [waveState.transitioning, waveState.enemiesGenerated, waveState.current, player]);
  
  // Check for wave completion
  useEffect(() => {
    if (enemies.length === 0 && waveState.enemiesGenerated && !waveState.complete) {
      waveManagerRef.current?.completeWave();
    }
  }, [enemies.length, waveState.enemiesGenerated, waveState.complete]);
  
  // Add CSS to hide cursor
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .game-container {
        cursor: none !important;
      }
      .game-container canvas {
        cursor: none !important;
      }
      body {
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="game-container relative w-[800px] h-[600px] mx-auto mt-8 bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-gray-600"
        onClick={hasGameStarted ? handlePause : handleStart}
      />
      
      <GameRenderer
        canvasRef={canvasRef}
        player={player}
        enemies={enemies}
        bullets={bullets}
        mousePosRef={mousePosRef}
        waveState={waveState}
        activeLightning={lightning.isActive ? lightning.chain : null}
      />
      
      {!hasGameStarted && <StartScreen />}
      {isPaused && <PauseOverlay />}
      
      <WaveInfo 
        wave={wave} 
        transitioning={waveState.transitioning}
        transitionEndTime={transitionEndTime}
      />
      <ScoreDisplay score={score} />
      <LightningCooldown lightning={lightning} />
      <ReflectionDisplay reflections={bulletReflections} />
      <WeaponDisplay weaponName={weaponName} />
    </div>
  );
};

export default Game;