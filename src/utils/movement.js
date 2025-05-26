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
export const calculateEnemyMovement = (enemy, player, minDistance = 50, canvasWidth = 800, canvasHeight = 600) => {
  // Stationary enemies don't move
  if (enemy.isStationary || enemy.speed === 0) {
    return { x: enemy.x, y: enemy.y };
  }
  
  // Floating enemies (like Spheroids)
  if (enemy.isFloater) {
    // Check if this is a clustered spheroid
    if (enemy.clusterId !== undefined && enemy.orbitAngle !== undefined) {
      // Update orbit angle
      enemy.orbitAngle += enemy.orbitSpeed;
      
      // Store cluster drift in a shared object (all enemies in same cluster share this)
      if (!window.clusterDrifts) {
        window.clusterDrifts = {};
      }
      
      const clusterId = enemy.clusterId;
      
      // Initialize cluster drift if not exists
      if (!window.clusterDrifts[clusterId]) {
        const waitTime = 60 + Math.floor(Math.random() * 120); // 1-3 seconds (60-180 frames)
        window.clusterDrifts[clusterId] = {
          dx: 0,
          dy: 0,
          centerX: enemy.clusterCenterX,
          centerY: enemy.clusterCenterY,
          targetAcquired: false,
          chargeTimer: 0,
          waitTime: waitTime // Store the wait time (1-3 seconds)
        };
        console.log(`Created cluster ${clusterId} with wait time ${waitTime} frames`);
      }
      
      const clusterDrift = window.clusterDrifts[clusterId];
      
      // Only the first enemy in each cluster should control cluster movement
      // This prevents multiple enemies from interfering with the timer
      if (!clusterDrift.controller) {
        clusterDrift.controller = enemy.id;
      }
      
      // Only the controller enemy updates cluster logic
      if (enemy.id === clusterDrift.controller) {
        // Only update charge timer when not moving
        if (clusterDrift.dx === 0 && clusterDrift.dy === 0) {
          clusterDrift.chargeTimer++;
          // Log every 60 frames (1 second)
          if (clusterDrift.chargeTimer % 60 === 0) {
            console.log(`Cluster ${clusterId} timer: ${clusterDrift.chargeTimer}/${clusterDrift.waitTime}`);
          }
        }
        
        // Wait for the stored wait time before charging
        if (clusterDrift.chargeTimer >= clusterDrift.waitTime) {
          // Calculate direction to player
          const dx = player.x + player.size / 2 - clusterDrift.centerX;
          const dy = player.y + player.size / 2 - clusterDrift.centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Set velocity toward player position (but faster)
            clusterDrift.dx = (dx / distance) * 2.5; // Speed of 2.5
            clusterDrift.dy = (dy / distance) * 2.5;
            clusterDrift.targetAcquired = true;
            clusterDrift.chargeTimer = 0;
            // Set a new random wait time for next charge
            clusterDrift.waitTime = 60 + Math.floor(Math.random() * 120); // 1-3 seconds
            console.log(`Cluster ${clusterId} charging! Next wait: ${clusterDrift.waitTime} frames`);
          }
        }
        
        // Update cluster center position
        clusterDrift.centerX += clusterDrift.dx;
        clusterDrift.centerY += clusterDrift.dy;
        
        // When cluster reaches a wall while moving, stop and reset timer
        const margin = 50; // Stop before the very edge
        const atLeftWall = clusterDrift.centerX <= margin && clusterDrift.dx < 0;
        const atRightWall = clusterDrift.centerX >= canvasWidth - margin && clusterDrift.dx > 0;
        const atTopWall = clusterDrift.centerY <= margin && clusterDrift.dy < 0;
        const atBottomWall = clusterDrift.centerY >= canvasHeight - margin && clusterDrift.dy > 0;
        
        if ((atLeftWall || atRightWall || atTopWall || atBottomWall) && clusterDrift.targetAcquired) {
          // Stop the cluster
          clusterDrift.dx = 0;
          clusterDrift.dy = 0;
          clusterDrift.targetAcquired = false;
          // Reset timer to 0 - will wait full 3-5 seconds before next charge
          clusterDrift.chargeTimer = 0;
          console.log(`Cluster ${clusterId} hit wall, timer reset. Will wait ${clusterDrift.waitTime} frames`);
        }
        
        // Keep cluster center within bounds
        clusterDrift.centerX = Math.max(margin, Math.min(canvasWidth - margin, clusterDrift.centerX));
        clusterDrift.centerY = Math.max(margin, Math.min(canvasHeight - margin, clusterDrift.centerY));
      }
      
      // Calculate new position based on orbit
      const newX = clusterDrift.centerX + Math.cos(enemy.orbitAngle) * enemy.orbitRadius;
      const newY = clusterDrift.centerY + Math.sin(enemy.orbitAngle) * enemy.orbitRadius;
      
      // Keep within bounds
      return {
        x: Math.max(0, Math.min(canvasWidth - enemy.size, newX)),
        y: Math.max(0, Math.min(canvasHeight - enemy.size, newY))
      };
    } else {
      // Old drift behavior for non-clustered floaters
      if (enemy.driftDx === undefined || enemy.driftDy === undefined) {
        const angle = Math.random() * Math.PI * 2;
        enemy.driftDx = Math.cos(angle);
        enemy.driftDy = Math.sin(angle);
      }
      
      if (Math.random() < 0.02) {
        const angleChange = (Math.random() - 0.5) * Math.PI / 2;
        const currentAngle = Math.atan2(enemy.driftDy, enemy.driftDx);
        const newAngle = currentAngle + angleChange;
        enemy.driftDx = Math.cos(newAngle);
        enemy.driftDy = Math.sin(newAngle);
      }
      
      let newX = enemy.x + enemy.driftDx * enemy.speed;
      let newY = enemy.y + enemy.driftDy * enemy.speed;
      
      if (newX <= 0 || newX >= canvasWidth - enemy.size) {
        enemy.driftDx = -enemy.driftDx;
        newX = enemy.x + enemy.driftDx * enemy.speed;
      }
      if (newY <= 0 || newY >= canvasHeight - enemy.size) {
        enemy.driftDy = -enemy.driftDy;
        newY = enemy.y + enemy.driftDy * enemy.speed;
      }
      
      return {
        x: Math.max(0, Math.min(canvasWidth - enemy.size, newX)),
        y: Math.max(0, Math.min(canvasHeight - enemy.size, newY))
      };
    }
  }
  
  // Regular enemies move toward player
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
