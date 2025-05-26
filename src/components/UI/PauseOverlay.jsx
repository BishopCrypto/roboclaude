import React from 'react';

const PauseOverlay = ({ hasGameStarted, isPaused }) => {
  // Only show if game has started and is currently paused
  if (!hasGameStarted || !isPaused) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '30px',
      borderRadius: '10px',
      textAlign: 'center',
      zIndex: 20,
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    }}>
      <h1 style={{ margin: '0 0 20px 0' }}>PAUSED</h1>
      <p>Press ESC to resume</p>
    </div>
  );
};

export default PauseOverlay;
