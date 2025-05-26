# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robotron 2084 Clone is a modern web-based remake of the classic arcade game built with React and HTML5 Canvas. The game features top-down shooter gameplay with wave-based enemy progression, dual-stick style controls (keyboard for movement, mouse for aiming/shooting), and classic arcade-style graphics.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot-reloading
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

## Architecture Overview

The application follows a React-based architecture with the following key components:

### Core Components

1. **Game.jsx** - Main component that manages:
   - Game state (score, wave, pause state)
   - Entity collections (player, enemies, bullets)
   - Game loop coordination
   - Collision detection
   - Wave progression

2. **GameRenderer.jsx** - Handles all canvas rendering, completely separated from game logic:
   - Draws player, enemies, bullets, UI elements
   - Uses vanilla Canvas API directly

3. **Entity Components** - Define properties and behaviors:
   - Player.jsx - Player character
   - Enemy.jsx - Enemy entities
   - Bullet.jsx - Projectiles

### Custom Hooks

1. **useGameLoop.js** - Implements game loop using requestAnimationFrame:
   - Provides consistent timing with deltaTime
   - Handles pausing/resuming
   - Ensures cleanup on unmount

2. **useKeyboard.js** - Keyboard input handling:
   - Tracks key states for movement controls (WASD/arrows)
   - Handles key combinations

3. **usePointerLock.js** - Mouse pointer capture for shooter controls:
   - Manages pointer lock API
   - Tracks relative mouse movement

4. **useGameSounds.js** - Sound effect management:
   - Handles sound pooling for performance
   - Manages different sound types

5. **useCursorStyle.js** - Cursor visibility control

### Utility Modules

1. **movement.js** - Movement calculations:
   - Vector-based movement helpers
   - Player and enemy movement logic
   - Direction calculations

2. **collision.js** - Collision detection system:
   - Circle-based collision for entities
   - Handles bullet-enemy and player-enemy collisions

3. **waves.js** - Wave generation and management:
   - Enemy spawning logic
   - Difficulty progression
   - Wave transition handling

## State Management

The game uses React's native state management through:
- useState for most state (player position, enemy collection, score, etc.)
- useRef for performance-critical values (mouse position)
- Custom hooks to encapsulate related state (keyboard, sound, pointer)

Game state is centralized in Game.jsx, with a game loop that updates positions, handles collisions, and manages game progression.

## Rendering Approach

The game uses a canvas-based rendering approach:
- All game elements are drawn directly to canvas
- Clear separation between game logic and rendering
- UI components use React for overlays (start screen, pause menu)
- Canvas rendering is optimized to handle multiple entities

## Key Implementation Details

1. **Auto-Shooting Mechanism**:
   - Time-based firing system
   - Direction calculated from player to mouse position

2. **Wave System**:
   - Progressive difficulty with wave transitions
   - Enemy spawn patterns vary by wave
   - Visual feedback during transitions

3. **Pointer Lock**:
   - Uses Browser Pointer Lock API
   - Relative mouse movement for aiming
   - Handles browser compatibility