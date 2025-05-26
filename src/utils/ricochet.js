/**
 * Find the nearest enemy to a bullet for ricochet targeting
 * @param {Object} bullet - The bullet object
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} excludeEnemy - Enemy to exclude from search (the one just hit)
 * @param {number} maxDistance - Maximum ricochet distance
 * @returns {Object|null} - The nearest enemy or null if none found
 */
export const findNearestEnemyForRicochet = (bullet, enemies, excludeEnemy = null, maxDistance = 300) => {
  let nearestEnemy = null;
  let minDistance = maxDistance;
  
  enemies.forEach(enemy => {
    // Skip the enemy that was just hit
    if (excludeEnemy && enemy === excludeEnemy) return;
    
    // Calculate distance from bullet to enemy center
    const enemyCenterX = enemy.x + enemy.size / 2;
    const enemyCenterY = enemy.y + enemy.size / 2;
    const bulletCenterX = bullet.x + bullet.size / 2;
    const bulletCenterY = bullet.y + bullet.size / 2;
    
    const dx = enemyCenterX - bulletCenterX;
    const dy = enemyCenterY - bulletCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestEnemy = enemy;
    }
  });
  
  return nearestEnemy;
};

/**
 * Calculate new bullet trajectory for ricochet
 * @param {Object} bullet - The bullet object
 * @param {Object} targetEnemy - The enemy to ricochet towards
 * @returns {Object} - New dx and dy values for the bullet
 */
export const calculateRicochetTrajectory = (bullet, targetEnemy) => {
  const bulletCenterX = bullet.x + bullet.size / 2;
  const bulletCenterY = bullet.y + bullet.size / 2;
  const enemyCenterX = targetEnemy.x + targetEnemy.size / 2;
  const enemyCenterY = targetEnemy.y + targetEnemy.size / 2;
  
  // Calculate angle to target
  const angle = Math.atan2(
    enemyCenterY - bulletCenterY,
    enemyCenterX - bulletCenterX
  );
  
  return {
    dx: Math.cos(angle),
    dy: Math.sin(angle)
  };
};
