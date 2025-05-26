import { useRef } from 'react';

const SOUND_POOL_SIZE = 10;

// Only create these once, not per hook call
const shootPool = Array.from({ length: SOUND_POOL_SIZE }, () => new window.Audio('/Robotron2084sfx/player-lazer.wav'));
const enemyHitPool = Array.from({ length: SOUND_POOL_SIZE }, () => new window.Audio('/Robotron2084sfx/robot-explode.wav'));
const walkPool = Array.from({ length: SOUND_POOL_SIZE }, () => new window.Audio('/Robotron2084sfx/grunt-walk.wav'));

const useGameSounds = () => {
  // Index trackers
  const shootIndex = useRef(0);
  const enemyHitIndex = useRef(0);
  const walkIndex = useRef(0);

  const playFromPool = (pool, indexRef, volume = 0.5) => {
    const audio = pool[indexRef.current];
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play();
    indexRef.current = (indexRef.current + 1) % SOUND_POOL_SIZE;
  };

  // For shoot and enemy hit, always use the first audio and cut it off
  const playShoot = () => {
    const audio = shootPool[0];
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play();
  };
  const playEnemyHit = () => {
    const audio = enemyHitPool[0];
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play();
  };
  const playWalk = () => playFromPool(walkPool, walkIndex, 0.5);

  return { playShoot, playEnemyHit, playWalk };
};

export default useGameSounds; 