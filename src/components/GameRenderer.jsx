import React from 'react';

const GameRenderer = ({ 
  canvasRef, 
  player, 
  enemies, 
  bullets, 
  mousePosRef, 
  waveState,
  activeLightning
}) => {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    
    // Draw enemies
    enemies.forEach(enemy => {
      const type = Number(enemy.type);
      console.log('Enemy type:', type, enemy);
      if (type === 0) {
        // Grunt: purple square
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      } else if (type === 1) {
        // Enforcer: red circle
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(
          enemy.x + enemy.size / 2,
          enemy.y + enemy.size / 2,
          enemy.size / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      } else if (type === 2) {
        // Tank: blue wide rectangle
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(enemy.x, enemy.y, enemy.size * 1.2, enemy.size * 0.7);
      } else if (type === 3) {
        // Turret: green octagon (stationary)
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        const radius = enemy.size / 2;
        
        // Draw octagon
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw inner circle to make it look like a turret
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Fallback: red square
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      }
      // Draw health bar above the enemy (centered for all shapes)
      const healthBarWidth = enemy.size;
      const healthBarHeight = 4;
      // Use enemy.maxHealth if present, otherwise fallback to initial health
      const maxHealth = typeof enemy.maxHealth === 'number' ? enemy.maxHealth : enemy.health;
      const currentHealth = typeof enemy.health === 'number' ? enemy.health : maxHealth;
      const clampedHealth = Math.max(0, Math.min(currentHealth, maxHealth));
      const healthPercentage = clampedHealth / maxHealth;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(
        enemy.x,
        enemy.y - 8,
        healthBarWidth,
        healthBarHeight
      );
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      ctx.fillRect(
        enemy.x,
        enemy.y - 8,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
      
      // Draw HP text above health bar
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.ceil(clampedHealth)}/${Math.ceil(maxHealth)}`,
        enemy.x + enemy.size / 2,
        enemy.y - 12
      );
      ctx.textAlign = 'left'; // Reset text alignment
    });
    
    // Draw bullets
    bullets.forEach(bullet => {
      if (bullet.type === 0) {
        // Rocket bullet: draw a longer triangle pointing in the direction of movement
        ctx.fillStyle = bullet.color;
        const angle = Math.atan2(bullet.dy, bullet.dx);
        const size = bullet.size;
        const length = 20; // Make the rocket longer
        
        // Draw the rocket body
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(
          bullet.x - length * Math.cos(angle),
          bullet.y - length * Math.sin(angle)
        );
        ctx.lineTo(
          bullet.x - (length - size) * Math.cos(angle) + size * Math.cos(angle + Math.PI/2),
          bullet.y - (length - size) * Math.sin(angle) + size * Math.sin(angle + Math.PI/2)
        );
        ctx.lineTo(
          bullet.x - (length - size) * Math.cos(angle) - size * Math.cos(angle + Math.PI/2),
          bullet.y - (length - size) * Math.sin(angle) - size * Math.sin(angle + Math.PI/2)
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw reflection count indicator for ricochet bullets
        if (bullet.reflectionsRemaining > 0) {
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            bullet.reflectionsRemaining.toString(),
            bullet.x - 5 * Math.cos(angle),
            bullet.y - 5 * Math.sin(angle) + 4
          );
          ctx.textAlign = 'left'; // Reset text alignment
        }
        
        // Draw a small trail
        ctx.strokeStyle = bullet.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x - length * Math.cos(angle), bullet.y - length * Math.sin(angle));
        ctx.lineTo(
          bullet.x - (length + 5) * Math.cos(angle),
          bullet.y - (length + 5) * Math.sin(angle)
        );
        ctx.stroke();
      } else if (bullet.type === 1) {
        // Line bullet
        ctx.strokeStyle = bullet.color;
        ctx.lineWidth = bullet.size > 10 ? 4 : 2; // Thicker line for lasers
        const length = bullet.length || bullet.size; // Use custom length if available
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x + bullet.dx * length, bullet.y + bullet.dy * length);
        ctx.stroke();
        
        // Draw reflection count indicator for ricochet bullets
        if (bullet.reflectionsRemaining > 0) {
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            bullet.reflectionsRemaining.toString(),
            bullet.x + bullet.dx * bullet.size / 2,
            bullet.y + bullet.dy * bullet.size / 2 + 4
          );
          ctx.textAlign = 'left'; // Reset text alignment
        }
      }
    });
    
    // Draw active lightning bolts
    if (activeLightning && activeLightning.length > 0) {
      activeLightning.forEach((link, index) => {
        drawLightningBolt(ctx, link.from, link.to, index);
      });
    }
    
    // Draw crosshair at mouse position
    const crosshairSize = 10;
    const mousePos = mousePosRef.current;
    ctx.strokeStyle = '#F59E0B';
    ctx.strokeRect(
      mousePos.x - crosshairSize / 2,
      mousePos.y - crosshairSize / 2,
      crosshairSize,
      crosshairSize
    );
    
    // Draw border
    ctx.strokeStyle = '#4B5563';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw instructions (only at the beginning)
    if (waveState.current === 1 && enemies.length > 0) {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(
        'Use WASD or Arrow Keys to move, Auto-shooting in direction of mouse',
        20,
        580
      );
    }
  }, [player, enemies, bullets, waveState, mousePosRef, activeLightning]);

  return null; // This component doesn't render anything directly
};

// Helper function to draw a lightning bolt
const drawLightningBolt = (ctx, from, to, index = 0) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 1) return;
  
  // Number of zigzag segments
  const segments = Math.max(3, Math.floor(distance / 20));
  
  // Create jagged lightning path
  const points = [from];
  
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const baseX = from.x + dx * t;
    const baseY = from.y + dy * t;
    
    // Add random offset perpendicular to the line
    const perpX = -dy / distance;
    const perpY = dx / distance;
    const offset = (Math.random() - 0.5) * 30; // Random zigzag
    
    points.push({
      x: baseX + perpX * offset,
      y: baseY + perpY * offset
    });
  }
  
  points.push(to);
  
  // Draw the main lightning bolt
  ctx.strokeStyle = '#60A5FA'; // Blue lightning
  ctx.lineWidth = 3;
  ctx.shadowColor = '#60A5FA';
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  // Draw thinner white core
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 5;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowBlur = 0;
};

export default GameRenderer; 