# Roboclaude Project Context

## Project Overview
Roboclaude is a modern web-based clone of the classic arcade game Robotron 2084, built with React and HTML5 Canvas. This is a fully functional game featuring top-down shooter gameplay with wave-based enemy progression.

## Project Location
- **Path**: /Users/ryan/Documents/roboclaude
- **Type**: React Web Application
- **Status**: Active Development

## Key Features
- Smooth player movement with WASD or arrow keys
- Auto-shooting in the direction of mouse/trackpad
- Enemy AI that follows the player
- Collision detection for bullets and enemies
- Custom crosshair and aim line
- Pause/unpause functionality
- Pointer lock for immersive gameplay
- Wave-based difficulty progression
- Score tracking

## Technology Stack
- **Framework**: React
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas
- **Language**: JavaScript
- **State Management**: React Hooks

## Project Structure
```
/Users/ryan/Documents/roboclaude/
├── src/
│   ├── components/
│   │   ├── Game.jsx          # Main game component
│   │   ├── GameRenderer.jsx  # Canvas rendering
│   │   ├── Player.jsx        # Player entity
│   │   ├── Enemy.jsx         # Enemy entities
│   │   └── Bullet.jsx        # Projectiles
│   ├── hooks/
│   │   ├── useGameLoop.js    # Game loop management
│   │   ├── useKeyboard.js    # Keyboard input
│   │   ├── usePointerLock.js # Mouse controls
│   │   ├── useGameSounds.js  # Sound effects
│   │   └── useCursorStyle.js # Cursor control
│   ├── utils/
│   │   ├── movement.js       # Movement calculations
│   │   ├── collision.js      # Collision detection
│   │   └── waves.js          # Wave generation
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── README.md               # Project documentation
├── PRD.md                  # Product requirements
├── CLAUDE.md               # Claude Code guidance
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Debug with Playwright
npm run debug
npm run debug-enhanced
npm run debug-esc
```

## Key Implementation Notes

### Architecture
- **Component-based**: Modular React components for game entities
- **Separation of Concerns**: Game logic separated from rendering
- **Performance-focused**: Uses refs for performance-critical values
- **Clean State Management**: Centralized state in Game.jsx

### Game Mechanics
- **Auto-shooting**: Time-based firing at 200ms intervals
- **Movement**: Vector-based movement system with boundary checking
- **Collision**: Circle-based collision detection
- **Wave System**: Progressive difficulty with enemy spawn patterns

### Controls
- **Movement**: WASD or Arrow Keys
- **Aiming**: Mouse/Trackpad
- **Pause**: ESC key
- **Special**: Space for lightning weapon
- **Start**: Click to begin

## Current Status
The game is fully playable with core mechanics implemented. Future enhancements may include:
- Power-ups and special weapons
- Different enemy types
- Boss encounters
- Sound effects and music
- Visual effects
- High score tracking

## Important Files
1. **README.md** - User-facing documentation
2. **PRD.md** - Detailed product requirements
3. **CLAUDE.md** - Development guidance for Claude Code
4. **package.json** - Project dependencies and scripts

## Development Tips
- Use `npm run dev` for hot-reloading during development
- Check PRD.md for detailed requirements
- Refer to CLAUDE.md for code conventions
- Test across different browsers for compatibility
- Maintain 60 FPS performance target