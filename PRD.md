# Robotron-2084 Inspired Game: Product Requirements Document

## 1. Introduction

### 1.1 Purpose

This document outlines the requirements and specifications for a web-based game inspired by the classic arcade game Robotron-2084. The game is built using React and modern web technologies to create a fast-paced, action-packed shooter experience.

### 1.2 Scope

The game is a browser-based implementation that captures the core gameplay mechanics of the original Robotron-2084 while adding modern features and improvements. It's designed to run on desktop browsers with keyboard and mouse controls.

### 1.3 Definitions

- **Player**: The user-controlled character that moves around the game area
- **Enemies**: Computer-controlled characters that attempt to attack the player
- **Wave**: A level of the game with a specific set of enemies
- **Pointer Lock**: Browser API that allows capturing mouse movement for game controls

## 2. Product Overview

### 2.1 Product Perspective

This game is a standalone web application built with React. It uses HTML5 Canvas for rendering and browser APIs for input handling. The game is designed to be played in modern web browsers without requiring additional plugins.

### 2.2 Product Features

- Top-down shooter gameplay
- Wave-based enemy progression
- Mouse-aimed auto-shooting
- Keyboard-controlled player movement
- Score tracking
- Pause/resume functionality

### 2.3 User Classes and Characteristics

The primary users are gamers familiar with arcade-style shooters who enjoy fast-paced action games. The game is designed to be accessible to casual players while providing a challenge for more experienced gamers.

## 3. Functional Requirements

### 3.1 Game Mechanics

#### 3.1.1 Player Movement

- The player character moves using WASD or arrow keys
- Movement is restricted to the boundaries of the game area
- Player speed is consistent and appropriate for the game's pace

#### 3.1.2 Shooting Mechanism

- Auto-shooting occurs in the direction of the mouse cursor
- Bullets fire at a fixed interval (200ms)
- Bullets travel in a straight line at a consistent speed
- Bullets are removed when they hit an enemy or leave the game area

#### 3.1.3 Enemy Behavior

- Enemies move toward the player at varying speeds
- Different enemy types may have different behaviors and health values
- Enemies are generated at the start of each wave
- Enemies are removed when their health reaches zero

#### 3.1.4 Wave System

- The game progresses through numbered waves
- Each wave contains a specific set of enemies
- A wave is complete when all enemies are defeated
- The next wave begins after a short transition period
- Each subsequent wave increases in difficulty

#### 3.1.5 Collision Detection

- Collisions are detected between bullets and enemies
- Enemies lose health or are destroyed when hit by bullets
- Score is awarded when enemies are destroyed

### 3.2 User Interface

#### 3.2.1 Game Canvas

- The main game area is an 800x600 pixel canvas
- The player, enemies, and bullets are rendered on this canvas
- Visual feedback is provided for game events (shooting, hits, etc.)

#### 3.2.2 HUD Elements

- Current wave number is displayed
- Current score is displayed
- Wave transition messages are shown between waves

#### 3.2.3 Start Screen

- Instructions for starting the game are displayed
- Game begins when the player clicks on the canvas

#### 3.2.4 Pause Overlay

- Game can be paused by pressing the Escape key
- A pause overlay is displayed when the game is paused
- Game resumes when the player clicks on the canvas again

### 3.3 Input Handling

#### 3.3.1 Keyboard Input

- WASD or arrow keys control player movement
- Escape key toggles pause state
- Input is disabled when the game is paused

#### 3.3.2 Mouse Input

- Mouse movement controls the aim direction
- Pointer lock is used to capture mouse movement
- Mouse position is tracked relative to the canvas

## 4. Non-Functional Requirements

### 4.1 Performance

- The game must maintain a consistent frame rate (target: 60 FPS)
- Input latency must be minimized for responsive controls
- The game should handle multiple enemies and bullets without performance degradation

### 4.2 Compatibility

- The game must work on modern browsers (Chrome, Firefox, Safari, Edge)
- The game should be responsive to different screen sizes
- The game should degrade gracefully on browsers without pointer lock support

### 4.3 Usability

- Controls should be intuitive and responsive
- Visual feedback should be clear and immediate
- Game state (paused, wave transitions) should be clearly communicated

## 5. Technical Implementation

### 5.1 Technology Stack

- **Framework**: React
- **Rendering**: HTML5 Canvas
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Input Handling**: Browser APIs (Pointer Lock, Keyboard Events)

### 5.2 Component Structure

- **Game**: Main component that manages game state and rendering
- **UI Components**: StartScreen, PauseOverlay, WaveInfo, ScoreDisplay
- **Custom Hooks**: useKeyboard, usePointerLock
- **Utility Functions**: Movement, collision detection, wave generation

### 5.3 State Management

- **Player State**: Position, size, speed
- **Enemy State**: Array of enemy objects with position, health, etc.
- **Bullet State**: Array of bullet objects with position, direction, etc.
- **Game State**: Wave number, pause state, score, etc.
- **Refs**: Used for stable access to state in intervals and event handlers

### 5.4 Game Loop

- Main game loop runs at approximately 60 FPS (16ms interval)
- Updates player, enemy, and bullet positions
- Checks for collisions
- Handles auto-shooting based on time intervals
- Updates game state reference

## 6. Future Enhancements

### 6.1 Planned Features

- Power-ups and special weapons
- Different enemy types with unique behaviors
- Boss encounters at milestone waves
- Sound effects and background music
- Visual effects for explosions and impacts
- Local high score tracking

### 6.2 Stretch Goals

- Mobile support with touch controls
- Multiplayer functionality
- Level editor
- Achievement system
- Integration with online leaderboards

## 7. Appendix

### 7.1 Key Implementation Details

#### 7.1.1 Auto-Shooting Logic

The auto-shooting mechanism uses a time-based approach to ensure consistent firing:

- A reference tracks the last shot time
- The game loop checks if enough time has passed since the last shot
- If the interval has elapsed, a new bullet is created
- The bullet direction is calculated based on player and mouse positions
- This approach ensures smooth shooting even during player or mouse movement

#### 7.1.2 Wave Transition Logic

Wave transitions follow a specific sequence:

1. When all enemies are defeated, the wave is marked as complete
2. A transition period begins with appropriate visual feedback
3. The wave number is incremented
4. New enemies are generated for the next wave
5. The transition ends and normal gameplay resumes

#### 7.1.3 Pointer Lock Implementation

The pointer lock feature is implemented using browser APIs:

- The canvas requests pointer lock when clicked
- Mouse movement is tracked differently when pointer is locked
- Relative movement (movementX/Y) is used instead of absolute positioning
- The pointer is unlocked when the game is paused
- A reference tracks mouse position to avoid state update delays

---

Document Version: 1.0  
Last Updated: May 17, 2025
