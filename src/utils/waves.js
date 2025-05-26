/**
 * Generate a random position away from the player
 * @param {Object} player - Player object with x, y properties
 * @param {number} minDistance - Minimum distance from player
 * @param {number} canvasWidth - Width of the game canvas
 * @param {number} canvasHeight - Height of the game canvas
 * @returns {Object} - Random position {x, y}
 */
export const generateRandomPosition = (player, minDistance = 150, canvasWidth = 800, canvasHeight = 600) => {
  let x, y, distance;
  
  // Keep generating positions until we find one that's far enough from the player
  do {
    x = Math.random() * (canvasWidth - 50) + 25; // Keep away from edges
    y = Math.random() * (canvasHeight - 50) + 25; // Keep away from edges
    
    // Calculate distance from player
    const dx = x - player.x;
    const dy = y - player.y;
    distance = Math.sqrt(dx * dx + dy * dy);
  } while (distance < minDistance);
  
  return { x, y };
};

/**
 * Generate enemies for a specific wave
 * @param {number} wave - Current wave number
 * @param {Object} player - Player object with x, y properties
 * @param {number} canvasWidth - Width of the game canvas
 * @param {number} canvasHeight - Height of the game canvas
 * @returns {Array} - Array of enemy objects for the wave
 */
export const generateWaveEnemies = (wave, player, canvasWidth = 800, canvasHeight = 600) => {
  const enemies = [];
  
  // Base number of enemies increases with wave number
  const baseEnemyCount = 3 + Math.floor(wave / 2);
  
  // Different enemy types based on wave
  const enemyTypes = [
    {
      type: 0, // Grunt
      color: '#8B5CF6', // Purple
      size: 25,
      speed: 1 + (wave * 0.2),
      health: 2,
      points: 100
    },
    {
      type: 1, // Enforcer
      color: '#EF4444', // Red
      size: 20,
      speed: 2 + (wave * 0.3),
      health: 2,
      points: 150
    },
    {
      type: 2, // Tank
      color: '#3B82F6', // Blue
      size: 35,
      speed: 0.7 + (wave * 0.1),
      health: 4,
      points: 300
    }
  ];
  
  // Add Spheroid enemies starting from wave 2
  const spheroidType = {
    type: 3, // Spheroid (floater/spawner)
    color: '#10B981', // Green
    size: 25, // Slightly smaller for better clustering visibility
    speed: 0.8, // Slow drifting speed
    health: 5,
    points: 200,
    isFloater: true, // Uses different movement pattern
    canShoot: true, // Can fire at player
    shootInterval: 3000 // Shoots every 3 seconds
  };
  
  // Create enemies for this wave
  for (let i = 0; i < baseEnemyCount; i++) {
    // Choose a random enemy type from available types
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Generate position away from player
    const position = generateRandomPosition(player);
    
    // Create enemy
    enemies.push({
      id: Date.now() + i, // Unique ID
      x: position.x,
      y: position.y,
      size: enemyType.size,
      speed: enemyType.speed,
      color: enemyType.color,
      health: enemyType.health,
      maxHealth: enemyType.health, // Store maxHealth for health bar
      points: enemyType.points,
      type: enemyType.type // Use the explicit type property!
    });
  }
  
  // Add Spheroid clusters starting from wave 2
  if (wave >= 2) {
    const numClusters = Math.floor((wave - 1) / 3) + 1; // 1 cluster at wave 2, 2 at wave 5, etc.
    const spheroidsPerCluster = 3 + Math.floor(wave / 4); // 3-5 spheroids per cluster
    
    for (let c = 0; c < numClusters; c++) {
      // Generate cluster center position
      const clusterCenter = generateRandomPosition(player, 250);
      
      // Create spheroids in this cluster
      for (let s = 0; s < spheroidsPerCluster; s++) {
        // Position spheroids in a circle around cluster center
        const angle = (s / spheroidsPerCluster) * Math.PI * 2;
        const radius = 30 + Math.random() * 15; // 30-45 pixels from center (tighter orbit)
        
        const spheroid = {
          id: Date.now() + baseEnemyCount + c * 100 + s,
          x: clusterCenter.x + Math.cos(angle) * radius,
          y: clusterCenter.y + Math.sin(angle) * radius,
          size: spheroidType.size,
          speed: spheroidType.speed,
          color: spheroidType.color,
          health: spheroidType.health,
          maxHealth: spheroidType.health,
          points: spheroidType.points,
          type: spheroidType.type,
          isFloater: spheroidType.isFloater,
          canShoot: spheroidType.canShoot,
          shootInterval: spheroidType.shootInterval,
          lastShotTime: 0,
          // Cluster-specific properties
          clusterId: c,
          clusterCenterX: clusterCenter.x,
          clusterCenterY: clusterCenter.y,
          orbitAngle: angle,
          orbitRadius: radius,
          orbitSpeed: 0.02 + Math.random() * 0.01 // Slightly random orbit speeds
        };
        
        // Ensure spheroid is within canvas bounds
        spheroid.x = Math.max(spheroidType.size, Math.min(canvasWidth - spheroidType.size, spheroid.x));
        spheroid.y = Math.max(spheroidType.size, Math.min(canvasHeight - spheroidType.size, spheroid.y));
        
        enemies.push(spheroid);
      }
    }
  }
  
  return enemies;
};

/**
 * Check if all enemies are defeated
 * @param {Array} enemies - Array of enemy objects
 * @returns {boolean} - True if all enemies are defeated
 */
export const isWaveComplete = (enemies) => {
  return enemies.length === 0;
};

/**
 * Get wave completion message
 * @param {number} wave - Current wave number
 * @returns {string} - Wave completion message
 */
export const getWaveMessage = (wave) => {
  const messages = [
    "Wave Complete!",
    "Impressive!",
    "Keep it up!",
    "They're getting stronger!",
    "You're unstoppable!",
    "Another wave down!",
    "They fear you now!",
    "Bring on the next wave!",
    "Enemies defeated!",
    "Victory is yours!"
  ];
  
  return messages[wave % messages.length];
};
