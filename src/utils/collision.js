/**
 * Check if two objects are colliding using circle collision detection
 * @param {Object} obj1 - First object with x, y, and size properties
 * @param {Object} obj2 - Second object with x, y, and size properties
 * @returns {boolean} - True if objects are colliding
 */
export const checkCollision = (obj1, obj2) => {
  // Calculate center points
  const obj1CenterX = obj1.x + obj1.size / 2;
  const obj1CenterY = obj1.y + obj1.size / 2;
  const obj2CenterX = obj2.x + obj2.size / 2;
  const obj2CenterY = obj2.y + obj2.size / 2;
  
  // Calculate distance between centers
  const dx = obj1CenterX - obj2CenterX;
  const dy = obj1CenterY - obj2CenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Check if distance is less than sum of radii
  return distance < (obj1.size + obj2.size) / 2;
};

import { findNearestEnemyForRicochet, calculateRicochetTrajectory } from './ricochet';

/**
 * Check if a bullet hits any enemies and handle ricochet
 * @param {Object} bullet - Bullet object
 * @param {Array} enemies - Array of enemy objects
 * @returns {Object} - { hitIndex: number, shouldRemoveBullet: boolean, updatedBullet: Object }
 */
export const checkBulletEnemyCollisionWithRicochet = (bullet, enemies) => {
  const hitIndex = enemies.findIndex(enemy => {
    // Skip if this bullet already hit this enemy (prevent double hits)
    if (bullet.lastHitEnemy === enemy) return false;
    
    // Calculate centers of both objects
    const bulletCenterX = bullet.x + bullet.size / 2;
    const bulletCenterY = bullet.y + bullet.size / 2;
    const enemyCenterX = enemy.x + enemy.size / 2;
    const enemyCenterY = enemy.y + enemy.size / 2;
    
    // Calculate distance between centers
    const dx = bulletCenterX - enemyCenterX;
    const dy = bulletCenterY - enemyCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check collision with a slightly more generous collision radius
    const collisionRadius = (bullet.size + enemy.size) / 2 + 2; // Added 2 pixels buffer
    
    return distance < collisionRadius;
  });
  
  if (hitIndex === -1) {
    return { hitIndex: -1, shouldRemoveBullet: false, updatedBullet: bullet };
  }
  
  const hitEnemy = enemies[hitIndex];
  let updatedBullet = { ...bullet, lastHitEnemy: hitEnemy };
  let shouldRemoveBullet = true;
  
  // Handle ricochet if reflections remaining
  if (bullet.reflectionsRemaining > 0) {
    const nextTarget = findNearestEnemyForRicochet(bullet, enemies, hitEnemy);
    
    if (nextTarget) {
      // Calculate new trajectory
      const newTrajectory = calculateRicochetTrajectory(bullet, nextTarget);
      
      // Update bullet with new direction and reduced reflections
      updatedBullet = {
        ...updatedBullet,
        dx: newTrajectory.dx,
        dy: newTrajectory.dy,
        reflectionsRemaining: bullet.reflectionsRemaining - 1,
        target: nextTarget, // For rocket bullets
        // Slightly reduce speed with each ricochet for balance
        speed: bullet.speed * 0.95
      };
      
      shouldRemoveBullet = false;
    }
  }
  
  return { hitIndex, shouldRemoveBullet, updatedBullet };
};

/**
 * Check if player is colliding with any enemies
 * @param {Object} player - Player object
 * @param {Array} enemies - Array of enemy objects
 * @param {boolean} isInvincible - Whether player is currently invincible
 * @returns {boolean} - True if player is hit by an enemy
 */
export const checkPlayerEnemyCollision = (player, enemies, isInvincible = false) => {
  if (isInvincible) return false;
  
  return enemies.some(enemy => checkCollision(player, enemy));
};
