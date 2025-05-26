import React, { useEffect, useState } from 'react';

const WaveInfo = ({ wave, isWaveComplete, isPaused }) => {
  const [showWaveMessage, setShowWaveMessage] = useState(false);
  const [waveStarting, setWaveStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Reset local state when the wave changes
  useEffect(() => {
    setShowWaveMessage(false);
    setWaveStarting(false);
    setCountdown(3);
  }, [wave]);
  
  // Show wave complete message when a wave is completed
  useEffect(() => {
    if (isWaveComplete && !isPaused) {
      setShowWaveMessage(true);
      
      // Hide message after 2 seconds
      const timer = setTimeout(() => {
        setShowWaveMessage(false);
        setWaveStarting(true);
        setCountdown(3);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isWaveComplete, isPaused]);
  
  // Handle countdown for next wave
  useEffect(() => {
    if (waveStarting && !isPaused) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else {
        setWaveStarting(false);
      }
    }
  }, [waveStarting, countdown, isPaused]);
  
  // Wave complete message
  if (showWaveMessage) {
    return (
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#10B981',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        zIndex: 5,
        animation: 'fadeIn 0.5s'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Wave {wave} Complete!</h2>
        <p style={{ margin: '0', fontSize: '18px' }}>Get ready for the next challenge...</p>
      </div>
    );
  }
  
  // Next wave countdown
  if (waveStarting) {
    return (
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#F59E0B',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        zIndex: 5
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Wave {wave + 1} Starting</h2>
        <p style={{ margin: '0', fontSize: '36px', fontWeight: 'bold' }}>{countdown}</p>
      </div>
    );
  }
  
  // Regular wave display (top-right corner)
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      zIndex: 5
    }}>
      <span style={{ fontWeight: 'bold' }}>Wave: {wave}</span>
    </div>
  );
};

export default WaveInfo;
