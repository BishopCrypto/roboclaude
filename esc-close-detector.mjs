import { chromium } from 'playwright';

async function captureWithEscDetection() {
  console.log('🚀 Starting Robotron 2084 with ESC detection...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Track ESC detection state
  let closeSignalDetected = false;
  
  // Console log listener with ESC detection
  page.on('console', async (msg) => {
    const text = msg.text();
    const logType = msg.type();
    
    // Always log console output
    console.log(`BROWSER CONSOLE [${logType}]: ${text}`);
    
    // Detect double ESC signal
    if (text.includes('DOUBLE ESC DETECTED') || 
        text.includes('PLAYWRIGHT_CLOSE_SIGNAL') ||
        text.includes('BROWSER_CLOSE_REQUEST')) {
      
      if (!closeSignalDetected) {
        closeSignalDetected = true;
        console.log('');
        console.log('🚨🚨🚨 DOUBLE ESC DETECTED! 🚨🚨🚨');
        console.log('🔔 Browser will close in 3 seconds...');
        console.log('');
        
        // Give user time to see the message
        setTimeout(async () => {
          console.log('🔒 Closing browser due to double ESC press...');
          await browser.close();
          console.log('✅ Browser closed successfully!');
          process.exit(0);
        }, 3000);
      }
    }
  });
  
  // Enhanced error handling
  page.on('pageerror', (error) => {
    console.log(`BROWSER ERROR: ${error.message}`);
  });
  
  console.log('📋 INSTRUCTIONS:');
  console.log('1. Click canvas to start the game');
  console.log('2. Use WASD/arrows to move, mouse to aim');
  console.log('3. Press ESC once to pause');
  console.log('4. Press ESC again (while paused) to close browser');
  console.log('5. Alternative: Shift+ESC for manual close');
  console.log('');
  
  // Navigate to game
  await page.goto('http://localhost:5179');
  console.log('📄 Game loaded successfully!');
  
  // Add Shift+ESC manual override
  await page.evaluate(() => {
    document.addEventListener('keydown', (event) => {
      if (event.shiftKey && event.key === 'Escape') {
        console.log('🔧 MANUAL CLOSE: Shift+ESC pressed');
        console.log('PLAYWRIGHT_CLOSE_SIGNAL: Manual close override');
      }
    });
  });
  
  // Auto-click canvas to help start the game
  await page.waitForTimeout(2000);
  try {
    await page.click('canvas', { force: true });
    console.log('🎮 Auto-clicked canvas to help start game');
  } catch (e) {
    console.log('⚠️  Could not auto-click canvas, click manually to start');
  }
  
  console.log('🎯 Game ready! Try the double ESC close feature!');
  
  // Keep running until closed
  await new Promise((resolve) => {
    // This will run indefinitely until browser is closed by ESC detection
    const keepAlive = setInterval(() => {
      if (closeSignalDetected) {
        clearInterval(keepAlive);
        resolve();
      }
    }, 1000);
  });
}

captureWithEscDetection().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
