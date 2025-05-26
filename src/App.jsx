import { useState, useEffect } from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const preventDefault = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', preventDefault, { passive: false });
    return () => window.removeEventListener('keydown', preventDefault);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <div 
      className="min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      <h1 className="text-white text-2xl mb-4">Robotron 2084</h1>
      <div className="relative">
        <Game />
      </div>
      <div className="mt-4 text-white text-sm">
        WASD to move • Mouse to aim • Space to shoot
      </div>
    </div>
  );
}

export default App;
