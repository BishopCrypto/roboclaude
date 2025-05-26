/**
 * GameLoop - Manages the main game update cycle
 * Coordinates state updates, collision detection, and rendering
 */

import { calculatePlayerMovement, calculateEnemyMovement } from '../utils/movement';
import { calculateBulletMovement } from '../utils/bulletMovement';
import GameStateManager from '../managers/GameStateManager';
import CollisionSystem from './CollisionSystem';

class GameLoop {
  constructor() {
    this.gameStateManager = new GameStateManager();
    this.collisionSystem = new CollisionSystem();
    this.lastShotTime = 0;
    this.shootInterval = 200; // ms between shots
    this.isPaused = false;
    this.isRunning = false;
    this.intervalId = null;
    
    // Callbacks
    this.onShoot = null;
    this.onEnemyHit = null;
    this.onPlayerHit = null;
    this.onStateUpdate = null;
    this.onWaveComplete = null;
  }

  /**
   * Initialize the game loop with initial state
   */
  init(initialState) {
    const { player, enemies, bullets, score, wave } = initialState;
    this.gameStateManager.init(player, enemies, bullets, score, wave);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    console.log('🟢 GameLoop: Starting game loop');
    this.isRunning = true;
    this.intervalId = setInterval(() => this.update(), 16); // ~60 FPS
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Pause/unpause the game loop
   */
  setPaused(paused) {
    this.isPaused = paused;
  }

  /**
   * Main update function
   */
  update() {
    if (this.isPaused) {
      console.log('🔴 GameLoop: Update skipped - game is paused');
      return;
    }

    // Log every 60 frames (once per second) to avoid spam
    if (!this.frameCount) this.frameCount = 0;
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      console.log('🟢 GameLoop: Update tick - playerInput:', this.playerInput, 'mousePos:', this.mousePos, 'isPointerLocked:', this.isPointerLocked);
    }
    
    const currentState = this.gameStateManager.getState();
    
    // Update player position
    if (this.playerInput) {
      const playerUpdates = calculatePlayerMovement(currentState.player, this.playerInput);
      this.gameStateManager.updatePlayer(playerUpdates);
    }

    // Update enemy positions
    this.gameStateManager.updateEnemyPositions((enemy, player) => 
      calculateEnemyMovement(enemy, player, 50, 800, 600)
    );

    // Update bullet positions
    this.gameStateManager.updateBulletPositions(
      (bullet, enemies) => calculateBulletMovement(bullet, enemies),
      { minX: 0, maxX: 800, minY: 0, maxY: 600 }
    );

    // Check bullet-enemy collisions
    const bullets = this.gameStateManager.bullets;
    const enemies = this.gameStateManager.enemies;
    const collisionResults = this.collisionSystem.checkBulletEnemyCollisions(bullets, enemies);
    
    // Process collisions
    if (collisionResults.length > 0) {
      const processedResults = this.gameStateManager.processCollisions(collisionResults);
      
      // Trigger callbacks for hits
      processedResults.forEach(result => {
        if (this.onEnemyHit) {
          this.onEnemyHit(result);
        }
      });
    }

    // Handle auto-shooting
    this.handleAutoShooting();

    // Handle enemy shooting
    this.handleEnemyShooting();

    // Check enemy bullet-player collisions
    const enemyBulletCollisions = this.collisionSystem.checkEnemyBulletPlayerCollisions(
      this.gameStateManager.bullets, 
      this.gameStateManager.player
    );
    
    if (enemyBulletCollisions.length > 0) {
      // Process enemy bullet hits on player
      enemyBulletCollisions.forEach(collision => {
        // Remove the bullet
        this.gameStateManager.removeBullet(collision.bulletIndex);
        
        // Damage the player
        if (this.onPlayerHit) {
          this.onPlayerHit(collision.damage);
        }
      });
    }

    // Check for wave completion
    if (this.gameStateManager.enemies.length === 0 && this.onWaveComplete) {
      this.onWaveComplete(this.gameStateManager.wave);
    }

    // Notify state update
    if (this.onStateUpdate) {
      this.onStateUpdate(this.gameStateManager.getState());
    }
  }

  /**
   * Handle auto-shooting logic
   */
  handleAutoShooting() {
    const now = Date.now();
    if (now - this.lastShotTime >= this.shootInterval && this.mousePos && this.isPointerLocked) {
      this.lastShotTime = now;
      
      if (this.onShoot) {
        const player = this.gameStateManager.player;
        const bulletOrBullets = this.onShoot(player, this.mousePos);
        if (bulletOrBullets) {
          // Handle both single bullet and array of bullets
          const bullets = Array.isArray(bulletOrBullets) ? bulletOrBullets : [bulletOrBullets];
          bullets.forEach(bullet => this.gameStateManager.addBullet(bullet));
        }
      }
    }
  }

  /**
   * Handle enemy shooting
   */
  handleEnemyShooting() {
    const now = Date.now();
    const player = this.gameStateManager.player;
    const enemies = this.gameStateManager.enemies;
    
    enemies.forEach(enemy => {
      if (enemy.canShoot && enemy.shootInterval) {
        // Initialize last shot time if not set
        if (!enemy.lastShotTime) {
          enemy.lastShotTime = now;
        }
        
        // Check if it's time to shoot
        if (now - enemy.lastShotTime >= enemy.shootInterval) {
          enemy.lastShotTime = now;
          
          // Calculate direction to player
          const dx = player.x + player.size / 2 - (enemy.x + enemy.size / 2);
          const dy = player.y + player.size / 2 - (enemy.y + enemy.size / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Create enemy bullet
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            
            const bullet = {
              x: enemy.x + enemy.size / 2,
              y: enemy.y + enemy.size / 2,
              dx: normalizedDx,
              dy: normalizedDy,
              speed: 3,
              size: 6,
              damage: 1,
              isEnemyBullet: true,
              color: '#FF6B6B' // Red color for enemy bullets
            };
            
            this.gameStateManager.addBullet(bullet);
          }
        }
      }
    });
  }

  /**
   * Update player input state
   */
  setPlayerInput(keys) {
    this.playerInput = keys;
  }

  /**
   * Update mouse position
   */
  setMousePosition(mousePos) {
    this.mousePos = mousePos;
  }

  /**
   * Update pointer lock state
   */
  setPointerLocked(locked) {
    this.isPointerLocked = locked;
  }

  /**
   * Get current game state
   */
  getState() {
    return this.gameStateManager.getState();
  }

  /**
   * Add enemies (for wave spawning)
   */
  addEnemies(enemies) {
    this.gameStateManager.setEnemies(enemies);
  }

  /**
   * Process lightning weapon
   */
  processLightning(lightningChain) {
    const enemies = this.gameStateManager.enemies;
    const lightningResults = this.collisionSystem.checkLightningCollisions(lightningChain, enemies);
    
    // Convert to collision format and process
    const collisionResults = lightningResults.map(result => ({
      bulletIndex: -1, // Lightning doesn't use bullets
      enemyIndex: result.enemyIndex,
      damage: result.damage
    }));
    
    return this.gameStateManager.processCollisions(collisionResults);
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    const { onShoot, onEnemyHit, onPlayerHit, onStateUpdate, onWaveComplete } = callbacks;
    this.onShoot = onShoot;
    this.onEnemyHit = onEnemyHit;
    this.onPlayerHit = onPlayerHit;
    this.onStateUpdate = onStateUpdate;
    this.onWaveComplete = onWaveComplete;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    this.gameStateManager = null;
    this.collisionSystem = null;
  }
}

export default GameLoop;