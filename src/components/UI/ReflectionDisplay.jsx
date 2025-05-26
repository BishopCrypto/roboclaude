import React from 'react';

const ReflectionDisplay = ({ reflectionCount }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 15px',
        borderRadius: '5px',
        border: reflectionCount > 0 ? '2px solid #F59E0B' : '2px solid #374151',
        zIndex: 10
      }}
    >
      Reflections: {reflectionCount}
      <div style={{ fontSize: '12px', marginTop: '5px', color: '#9CA3AF' }}>
        Press 1-9 to set, 0 to reset
      </div>
    </div>
  );
};

export default ReflectionDisplay;
