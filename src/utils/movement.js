/**
 * Calculate normalized direction vector
 * @param {number} dx - X component of direction
 * @param {number} dy - Y component of direction
 * @returns {Object} - Normalized direction vector {dx, dy}
 */
export const normalizeDirection = (dx, dy) => {
  if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };
  
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    dx: dx / length,
    dy: dy / length
  };
};

/**
 * Calculate new player position based on keyboard input
 * @param {Object} player - Player object with x, y, size, and speed properties
 * @param {Object} keys - Object tracking which keys are pressed
 * @param {number} canvasWidth - Width of the game canvas
 * @param {number} canvasHeight - Height of the game canvas
 * @returns {Object} - New player position {x, y}
 */
export const calculatePlayerMovement = (player, keys, canvasWidth = 800, canvasHeight = 600) => {
  // Calculate movement direction
  let dx = 0;
  let dy = 0;
  
  // Check which keys are pressed
  if (keys.w || keys.arrowup) dy -= 1;
  if (keys.s || keys.arrowdown) dy += 1;
  if (keys.a || keys.arrowleft) dx -= 1;
  if (keys.d || keys.arrowright) dx += 1;
  
  // If no movement, return unchanged position
  if (dx === 0 && dy === 0) return { x: player.x, y: player.y };
  
  // Normalize diagonal movement
  const normalized = normalizeDirection(dx, dy);
  
  // Calculate new position
  const newX = Math.max(0, Math.min(canvasWidth - player.size, player.x + normalized.dx * player.speed));
  const newY = Math.max(0, Math.min(canvasHeight - player.size, player.y + normalized.dy * player.speed));
  
  return { x: newX, y: newY };
};

/**
 * Calculate enemy movement toward player
 * @param {Object} enemy - Enemy object with x, y, size, and speed properties
 * @param {Object} player - Player object with x, y properties
 * @param {number} minDistance - Minimum distance to maintain from player
 * @returns {Object} - New enemy position {x, y}
 */
export const calculateEnemyMovement = (enemy, player, minDistance = 50) => {
  // Calculate direction toward player
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Only move if not too close to player
  if (distance <= minDistance) {
    return { x: enemy.x, y: enemy.y };
  }
  
  // Normalize direction
  const normalized = normalizeDirection(dx, dy);
  
  // Update position
  return {
    x: enemy.x + normalized.dx * enemy.speed,
    y: enemy.y + normalized.dy * enemy.speed
  };
};

/**
 * Calculate bullet movement
 * @param {Object} bullet - Bullet object with x, y, dx, dy, and speed properties
 * @returns {Object} - New bullet position {x, y}
 */
export const calculateBulletMovement = (bullet) => {
  return {
    x: bullet.x + bullet.dx * bullet.speed,
    y: bullet.y + bullet.dy * bullet.speed
  };
};
