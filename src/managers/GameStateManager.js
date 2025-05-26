/**
 * GameStateManager - Manages game state updates in a controlled, predictable way
 * Ensures that enemy health updates and other state changes are properly tracked
 */

class GameStateManager {
  constructor() {
    this.enemies = [];
    this.bullets = [];
    this.player = null;
    this.score = 0;
    this.wave = 1;
  }

  // Initialize state
  init(player, enemies = [], bullets = [], score = 0, wave = 1) {
    this.player = player;
    this.enemies = enemies;
    this.bullets = bullets;
    this.score = score;
    this.wave = wave;
  }

  // Update player position
  updatePlayer(newPlayerState) {
    this.player = { ...this.player, ...newPlayerState };
    return this.player;
  }

  // Update all enemies with new positions
  updateEnemyPositions(enemyUpdateFn) {
    this.enemies = this.enemies.map(enemy => {
      const updates = enemyUpdateFn(enemy, this.player);
      return { ...enemy, ...updates };
    });
    return this.enemies;
  }

  // Update all bullets with new positions
  updateBulletPositions(bulletUpdateFn, boundaries) {
    this.bullets = this.bullets
      .map(bullet => {
        const updates = bulletUpdateFn(bullet, this.enemies);
        return { ...bullet, ...updates };
      })
      .filter(bullet => 
        bullet.x >= boundaries.minX && 
        bullet.x <= boundaries.maxX && 
        bullet.y >= boundaries.minY && 
        bullet.y <= boundaries.maxY
      );
    return this.bullets;
  }

  // Add a new bullet
  addBullet(bullet) {
    this.bullets.push(bullet);
    return this.bullets;
  }

  // Handle collision between a bullet and enemies
  handleBulletEnemyCollision(bulletIndex, enemyIndex, damage = 1) {
    // Lightning damage has bulletIndex of -1
    if (bulletIndex !== -1 && (bulletIndex < 0 || bulletIndex >= this.bullets.length)) return false;
    if (enemyIndex < 0 || enemyIndex >= this.enemies.length) return false;

    const enemy = this.enemies[enemyIndex];
    const currentHealth = typeof enemy.health === 'number' ? enemy.health : 2;
    const newHealth = currentHealth - damage;

    if (newHealth <= 0) {
      // Enemy dies
      this.score += enemy.points || 100;
      this.enemies.splice(enemyIndex, 1);
      return { enemyKilled: true, scoreGained: enemy.points || 100 };
    } else {
      // Enemy takes damage
      this.enemies[enemyIndex] = { ...enemy, health: newHealth };
      return { enemyKilled: false, newHealth };
    }
  }

  // Remove bullet by index
  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
    return this.bullets;
  }

  // Update bullet (for ricochets)
  updateBullet(index, updates) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets[index] = { ...this.bullets[index], ...updates };
    }
    return this.bullets[index];
  }

  // Batch collision processing
  processCollisions(collisionResults) {
    // Sort collision results by bullet index in descending order
    // This ensures we remove bullets from the end first
    const sortedResults = [...collisionResults].sort((a, b) => b.bulletIndex - a.bulletIndex);
    
    const processedResults = [];
    
    sortedResults.forEach(result => {
      const { bulletIndex, enemyIndex, shouldRemoveBullet, bulletUpdates } = result;
      
      // Handle enemy damage
      if (enemyIndex >= 0) {
        const damage = result.damage || 1;
        const damageResult = this.handleBulletEnemyCollision(bulletIndex, enemyIndex, damage);
        processedResults.push({ ...result, ...damageResult });
      }
      
      // Handle bullet updates or removal
      if (shouldRemoveBullet) {
        this.removeBullet(bulletIndex);
      } else if (bulletUpdates) {
        this.updateBullet(bulletIndex, bulletUpdates);
      }
    });
    
    return processedResults;
  }

  // Get current state
  getState() {
    return {
      player: this.player,
      enemies: [...this.enemies],
      bullets: [...this.bullets],
      score: this.score,
      wave: this.wave
    };
  }

  // Set enemies (for wave transitions)
  setEnemies(enemies) {
    this.enemies = enemies;
    return this.enemies;
  }

  // Set score
  setScore(score) {
    this.score = score;
    return this.score;
  }

  // Set wave
  setWave(wave) {
    this.wave = wave;
    return this.wave;
  }
}

export default GameStateManager;