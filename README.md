# Robotron 2084 Clone

A modern web-based clone of the classic arcade game Robotron 2084, built with React and Canvas.

## Features

- Smooth player movement with WASD or arrow keys
- Auto-shooting in the direction of your mouse/trackpad
- Enemy AI that follows the player
- Collision detection for bullets and enemies
- Custom crosshair and aim line
- Pause/unpause functionality
- Pointer lock for immersive gameplay

## Controls

- **WASD or Arrow Keys**: Move the player
- **Mouse/Trackpad**: Aim your shots
- **Q or Tab**: Switch weapons ⭐ NEW
- **0-9**: Set ricochet count (bullets bounce between enemies)
- **Space**: Lightning weapon (area damage with cooldown)
- **ESC**: Pause/unpause the game
- **Click**: Start game or unpause

## Weapons ⭐ NEW

1. **Standard**: Basic yellow bullets
2. **Homing Rockets**: Red rockets that seek enemies
3. **Spread Shot**: Triple cyan bullets in a spread pattern
4. **Laser**: Fast, powerful red beams

## Technologies Used

- React
- HTML5 Canvas
- Vite
- JavaScript

## Development

This project was built using Vite for fast development and hot module replacement.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Debug with Playwright (console capture)
npm run debug

# Debug with ESC close detection
npm run debug-esc

# Test ESC detection feature
./test-esc-detection.sh
```

### 🐛 Debugging with Playwright ⭐

This project includes advanced debugging capabilities using Playwright:

- **Real-time console capture**: See all `console.log()` output in terminal
- **Visual browser window**: Watch the game while debugging
- **Automated testing**: Scripts can interact with the game
- **ESC close detection**: Press ESC twice to close browser from within the game

**Available debugging scripts:**
- `npm run debug` - Basic console capture
- `npm run debug-enhanced` - Enhanced with auto-testing
- `npm run debug-esc` - Focus on ESC detection feature

**ESC Close Feature**: 
1. Press ESC once to pause the game
2. Press ESC again to close the browser automatically
3. Alternative: Shift+ESC for manual close
