import React from 'react';

const ScoreDisplay = ({ score }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      zIndex: 5
    }}>
      <span style={{ fontWeight: 'bold' }}>Score: {score.toLocaleString()}</span>
    </div>
  );
};

export default ScoreDisplay;
