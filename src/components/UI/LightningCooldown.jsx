import React from 'react';

const LightningCooldown = ({ isOnCooldown, cooldownPercentage }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: 'white',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 15px',
        borderRadius: '5px',
        border: isOnCooldown ? '2px solid #6B7280' : '2px solid #60A5FA',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>⚡ Lightning</span>
        {isOnCooldown && (
          <div 
            style={{
              width: '100px',
              height: '8px',
              backgroundColor: '#374151',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: `${100 - cooldownPercentage}%`,
                height: '100%',
                backgroundColor: '#60A5FA',
                transition: 'width 0.1s ease'
              }}
            />
          </div>
        )}
      </div>
      <div style={{ fontSize: '12px', marginTop: '5px', color: '#9CA3AF' }}>
        {isOnCooldown ? 'Recharging...' : 'Press SPACE to activate'}
      </div>
    </div>
  );
};

export default LightningCooldown;
