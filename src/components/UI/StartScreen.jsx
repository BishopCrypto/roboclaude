import React from 'react';

const StartScreen = ({ hasGameStarted, isPaused }) => {
  // Only show if game hasn't started yet and is paused
  if (hasGameStarted || !isPaused) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '20px',
      borderRadius: '5px',
      textAlign: 'center',
      zIndex: 10
    }}>
      <h2>Click to Play</h2>
      <p>Click on the game to start playing.</p>
      <p>Use WASD to move, mouse to aim, space for lightning.</p>
    </div>
  );
};

export default StartScreen;
