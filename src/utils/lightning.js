/**
 * Calculate a lightning chain starting from the player
 * @param {Object} player - Player object with x, y, size
 * @param {Array} enemies - Array of enemy objects
 * @param {number} maxRange - Maximum distance for lightning jumps (default: 150)
 * @returns {Array} - Array of chain links: [{from: {x, y}, to: {x, y}, enemy: enemyObject}]
 */
export const calculateLightningChain = (player, enemies, maxRange = 150) => {
  if (enemies.length === 0) return [];
  
  const chain = [];
  const usedEnemies = new Set();
  
  // Starting point is player center
  const playerCenter = {
    x: player.x + player.size / 2,
    y: player.y + player.size / 2
  };
  
  let currentPos = playerCenter;
  
  // Find the nearest enemy to player
  let nearestEnemy = findNearestEnemy(currentPos, enemies, usedEnemies, maxRange);
  
  while (nearestEnemy) {
    const enemyCenter = {
      x: nearestEnemy.x + nearestEnemy.size / 2,
      y: nearestEnemy.y + nearestEnemy.size / 2
    };
    
    // Add this link to the chain
    chain.push({
      from: { ...currentPos },
      to: { ...enemyCenter },
      enemy: nearestEnemy
    });
    
    // Mark this enemy as used
    usedEnemies.add(nearestEnemy);
    
    // Move to this enemy's position for next jump
    currentPos = enemyCenter;
    
    // Find next nearest enemy from current position
    nearestEnemy = findNearestEnemy(currentPos, enemies, usedEnemies, maxRange);
  }
  
  return chain;
};

/**
 * Find the nearest unused enemy within range
 * @param {Object} position - Current position {x, y}
 * @param {Array} enemies - Array of enemy objects
 * @param {Set} usedEnemies - Set of already used enemies
 * @param {number} maxRange - Maximum search range
 * @returns {Object|null} - Nearest enemy or null if none found
 */
const findNearestEnemy = (position, enemies, usedEnemies, maxRange) => {
  let nearestEnemy = null;
  let minDistance = maxRange;
  
  enemies.forEach(enemy => {
    if (usedEnemies.has(enemy)) return;
    
    const enemyCenter = {
      x: enemy.x + enemy.size / 2,
      y: enemy.y + enemy.size / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(position.x - enemyCenter.x, 2) + 
      Math.pow(position.y - enemyCenter.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestEnemy = enemy;
    }
  });
  
  return nearestEnemy;
};

/**
 * Apply lightning damage to all enemies in the chain
 * @param {Array} lightningChain - Chain of lightning links
 * @param {number} damage - Damage per enemy (default: 3)
 * @returns {Array} - Array of enemies that were hit by lightning
 */
export const applyLightningDamage = (lightningChain, damage = 3) => {
  const hitEnemies = [];
  
  lightningChain.forEach(link => {
    if (link.enemy) {
      hitEnemies.push({
        enemy: link.enemy,
        damage: damage
      });
    }
  });
  
  return hitEnemies;
};
