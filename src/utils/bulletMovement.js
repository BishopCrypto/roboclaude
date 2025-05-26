/**
 * Calculate bullet movement and handle homing behavior
 */

export const calculateBulletMovement = (bullet, enemies = []) => {
  let newPosition = {
    x: bullet.x + bullet.dx * bullet.speed,
    y: bullet.y + bullet.dy * bullet.speed
  };

  // Handle rocket/homing bullets
  if (bullet.type === 0) {
    let target = bullet.target;
    
    // Find new target if current one is destroyed or no target exists
    if (!target || !enemies.find(e => e === target)) {
      let nearestEnemy = null;
      let minDistance = Infinity;
      const bulletAngle = Math.atan2(bullet.dy, bullet.dx);
      
      enemies.forEach(enemy => {
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToEnemy = Math.atan2(dy, dx);
        const angleDiff = Math.abs(angleToEnemy - bulletAngle);
        
        // Only consider enemies within a 90-degree cone in front of the rocket
        if (angleDiff < Math.PI/2 && distance < minDistance) {
          minDistance = distance;
          nearestEnemy = enemy;
        }
      });
      
      target = nearestEnemy;
    }
    
    if (target) {
      // Gradually turn toward target
      const targetAngle = Math.atan2(
        target.y - bullet.y,
        target.x - bullet.x
      );
      const currentAngle = Math.atan2(bullet.dy, bullet.dx);
      const turnRate = 0.1; // Limited turning radius
      const newAngle = currentAngle + (targetAngle - currentAngle) * turnRate;
      
      newPosition = {
        ...newPosition,
        dx: Math.cos(newAngle),
        dy: Math.sin(newAngle),
        target: target
      };
    } else {
      // No target, continue in current direction
      newPosition = {
        ...newPosition,
        target: null
      };
    }
  }

  return newPosition;
};