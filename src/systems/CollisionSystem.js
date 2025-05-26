/**
 * CollisionSystem - Handles all collision detection and resolution
 * Provides a clean interface for checking collisions between game entities
 */

import { checkCollision, checkBulletEnemyCollisionWithRicochet } from '../utils/collision';

class CollisionSystem {
  constructor() {
    this.collisionResults = [];
  }

  /**
   * Process all bullet-enemy collisions for a frame
   * Returns an array of collision results to be processed by GameStateManager
   */
  checkBulletEnemyCollisions(bullets, enemies) {
    this.collisionResults = [];
    
    bullets.forEach((bullet, bulletIndex) => {
      // Skip enemy bullets - they don't hit other enemies
      if (bullet.isEnemyBullet) return;
      
      const collisionResult = checkBulletEnemyCollisionWithRicochet(bullet, enemies);
      const { hitIndex, shouldRemoveBullet, updatedBullet } = collisionResult;
      
      if (hitIndex !== -1) {
        this.collisionResults.push({
          type: 'bullet-enemy',
          bulletIndex,
          enemyIndex: hitIndex,
          bullet,
          enemy: enemies[hitIndex],
          shouldRemoveBullet,
          bulletUpdates: shouldRemoveBullet ? null : {
            dx: updatedBullet.dx,
            dy: updatedBullet.dy,
            reflectionsRemaining: updatedBullet.reflectionsRemaining,
            lastHitEnemy: updatedBullet.lastHitEnemy,
            speed: updatedBullet.speed,
            target: updatedBullet.target
          }
        });
      }
    });
    
    return this.collisionResults;
  }

  /**
   * Check if player collides with any enemy
   */
  checkPlayerEnemyCollision(player, enemies, isInvincible = false) {
    if (isInvincible) return null;
    
    for (let i = 0; i < enemies.length; i++) {
      if (checkCollision(player, enemies[i])) {
        return {
          type: 'player-enemy',
          enemyIndex: i,
          enemy: enemies[i]
        };
      }
    }
    
    return null;
  }

  /**
   * Check collisions for lightning chain
   */
  checkLightningCollisions(lightningChain, enemies) {
    const hitResults = [];
    
    lightningChain.forEach(link => {
      const enemy = link.to;
      if (enemies.includes(enemy)) {
        const enemyIndex = enemies.indexOf(enemy);
        hitResults.push({
          type: 'lightning-enemy',
          enemyIndex,
          enemy,
          damage: link.damage || 1
        });
      }
    });
    
    return hitResults;
  }

  /**
   * Check enemy bullet collisions with player
   */
  checkEnemyBulletPlayerCollisions(bullets, player, isInvincible = false) {
    if (isInvincible) return [];
    
    const hitResults = [];
    
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.isEnemyBullet && checkCollision(bullet, player)) {
        hitResults.push({
          type: 'enemy-bullet-player',
          bulletIndex,
          bullet,
          damage: bullet.damage || 1
        });
      }
    });
    
    return hitResults;
  }

  /**
   * Clear collision results
   */
  clearResults() {
    this.collisionResults = [];
  }

  /**
   * Get last frame's collision results
   */
  getLastResults() {
    return this.collisionResults;
  }
}

export default CollisionSystem;