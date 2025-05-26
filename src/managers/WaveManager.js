/**
 * WaveManager - Manages wave progression, enemy spawning, and transitions
 */

import { generateWaveEnemies } from '../utils/waves';

class WaveManager {
  constructor() {
    this.currentWave = 1;
    this.waveState = {
      enemiesGenerated: false,
      complete: false,
      transitioning: false,
      starting: true
    };
    this.transitionDuration = 1000; // 1 second transition
    this.transitionEndTime = null;
    
    // Callbacks
    this.onWaveStart = null;
    this.onWaveComplete = null;
    this.onTransitionStart = null;
    this.onTransitionEnd = null;
  }

  /**
   * Initialize wave manager
   */
  init(startingWave = 1) {
    this.currentWave = startingWave;
    this.waveState = {
      enemiesGenerated: false,
      complete: false,
      transitioning: false,
      starting: true
    };
  }

  /**
   * Generate enemies for the current wave
   */
  generateEnemies(player) {
    if (this.waveState.enemiesGenerated) {
      return null;
    }

    const enemies = generateWaveEnemies(this.currentWave, player);
    this.waveState.enemiesGenerated = true;
    this.waveState.starting = false;
    
    if (this.onWaveStart) {
      this.onWaveStart(this.currentWave, enemies);
    }
    
    return enemies;
  }

  /**
   * Mark current wave as complete
   */
  completeWave() {
    if (!this.waveState.complete) {
      this.waveState.complete = true;
      
      // Clear cluster drifts for next wave
      if (window.clusterDrifts) {
        window.clusterDrifts = {};
      }
      
      if (this.onWaveComplete) {
        this.onWaveComplete(this.currentWave);
      }
    }
  }

  /**
   * Start wave transition
   */
  startTransition() {
    if (!this.waveState.transitioning && this.waveState.complete) {
      this.waveState.transitioning = true;
      this.transitionEndTime = Date.now() + this.transitionDuration;
      
      if (this.onTransitionStart) {
        this.onTransitionStart(this.currentWave);
      }
    }
  }

  /**
   * Check if transition is complete
   */
  checkTransition() {
    if (this.waveState.transitioning && this.transitionEndTime) {
      if (Date.now() >= this.transitionEndTime) {
        this.endTransition();
        return true;
      }
    }
    return false;
  }

  /**
   * End transition and prepare next wave
   */
  endTransition() {
    this.currentWave++;
    this.waveState = {
      enemiesGenerated: false,
      complete: false,
      transitioning: false,
      starting: false
    };
    
    if (this.onTransitionEnd) {
      this.onTransitionEnd(this.currentWave);
    }
  }

  /**
   * Get current wave number
   */
  getCurrentWave() {
    return this.currentWave;
  }

  /**
   * Get wave state
   */
  getWaveState() {
    return { ...this.waveState };
  }

  /**
   * Check if we should generate enemies
   */
  shouldGenerateEnemies() {
    return !this.waveState.enemiesGenerated && 
           !this.waveState.transitioning && 
           !this.waveState.complete;
  }

  /**
   * Check if wave is in progress
   */
  isWaveInProgress() {
    return this.waveState.enemiesGenerated && 
           !this.waveState.complete && 
           !this.waveState.transitioning;
  }

  /**
   * Force complete current wave (for testing)
   */
  forceCompleteWave() {
    this.completeWave();
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    const { onWaveStart, onWaveComplete, onTransitionStart, onTransitionEnd } = callbacks;
    this.onWaveStart = onWaveStart;
    this.onWaveComplete = onWaveComplete;
    this.onTransitionStart = onTransitionStart;
    this.onTransitionEnd = onTransitionEnd;
  }
}

export default WaveManager;