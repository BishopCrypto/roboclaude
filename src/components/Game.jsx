import React, { useState, useEffect, useRef } from 'react';
import GameRenderer from './GameRenderer';
import StartScreen from './UI/StartScreen';
import PauseOverlay from './UI/PauseOverlay';
import WaveInfo from './UI/WaveInfo';
import ScoreDisplay from './UI/ScoreDisplay';
import LightningCooldown from './UI/LightningCooldown';
import ReflectionDisplay from './UI/ReflectionDisplay';
import useKeyboard from '../hooks/useKeyboard';
import usePointerLock from '../hooks/usePointerLock';
import useGameSounds from '../hooks/useGameSounds';
import useLightningWeapon from '../hooks/useLightningWeapon';
import useReflectionInput from '../hooks/useReflectionInput';
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
    starting: true
  });
  const [isPaused, setIsPaused] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [transitionEndTime, setTransitionEndTime] = useState(null);
  
  // Custom hooks
  const keys = useKeyboard();
  const { isPointerLocked, requestPointerLock, exitPointerLock } = usePointerLock(canvasRef);
  const { playShoot, playEnemyHit, playWalk } = useGameSounds();
  const lightning = useLightningWeapon();
  const bulletReflections = useReflectionInput();
  
  // Track space key for lightning
  const spaceKeyPressed = useRef(false);
  const lastWalkSoundTimeRef = useRef(0);
  
  // Initialize game systems
  useEffect(() => {
    // Create game loop
    gameLoopRef.current = new GameLoop();
    
    // Create wave manager
    waveManagerRef.current = new WaveManager();
    
    // Set up callbacks
    gameLoopRef.current.setCallbacks({
      onShoot: (player, mousePos) => {
        playShoot();
        
        // Calculate bullet direction
        const angle = Math.atan2(
          mousePos.y - (player.y + player.size / 2),
          mousePos.x - (player.x + player.size / 2)
        );
        
        const speed = 10;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        return {
          x: player.x + player.size / 2 - 2.5,
          y: player.y + player.size / 2 - 2.5,
          dx,
          dy,
          size: 5,
          speed,
          damage: 1,
          type: 0, // Regular bullet
          color: '#FBBF24',
          reflectionsRemaining: bulletReflections
        };
      },
      
      onEnemyHit: (result) => {
        playEnemyHit();
      },
      
      onStateUpdate: (state) => {
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
  }, [playShoot, playEnemyHit, bulletReflections]);
  
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
      gameLoopRef.current.setPlayerInput(keys);
      gameLoopRef.current.setMousePosition(mousePosRef.current);
      gameLoopRef.current.setPointerLocked(isPointerLocked);
      gameLoopRef.current.setPaused(isPaused);
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
  
  // Handle ESC key for pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && hasGameStarted && !isPaused) {
        setIsPaused(true);
        exitPointerLock();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isPaused, hasGameStarted, exitPointerLock]);
  
  // Handle lightning weapon
  useEffect(() => {
    if (keys[' '] && !spaceKeyPressed.current && !isPaused && lightning.canActivate()) {
      spaceKeyPressed.current = true;
      
      const lightningChain = calculateLightningChain(player, enemies);
      if (lightningChain.length > 0) {
        const hitResults = applyLightningDamage(lightningChain);
        lightning.activate(lightningChain);
        
        // Process lightning damage through game loop
        if (gameLoopRef.current) {
          gameLoopRef.current.processLightning(lightningChain);
        }
        
        playEnemyHit();
      }
    }
    
    if (!keys[' ']) {
      spaceKeyPressed.current = false;
    }
  }, [keys, isPaused, lightning, player, enemies, playEnemyHit]);
  
  // Initialize first wave
  useEffect(() => {
    if (hasGameStarted && !isPaused && isPointerLocked && !waveState.enemiesGenerated) {
      const waveManager = waveManagerRef.current;
      const gameLoop = gameLoopRef.current;
      
      if (waveManager && gameLoop) {
        const newEnemies = waveManager.generateEnemies(player);
        if (newEnemies) {
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
    </div>
  );
};

export default Game;