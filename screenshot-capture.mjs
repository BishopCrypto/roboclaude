import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

async function captureScreenshotsEverySecond() {
  // Create temporary folder for screenshots
  const tempDir = path.join(process.cwd(), 'temp-screenshots');
  
  try {
    await mkdir(tempDir, { recursive: true });
    console.log(`📁 Created screenshot directory: ${tempDir}`);
  } catch (err) {
    console.log(`📁 Screenshot directory already exists: ${tempDir}`);
  }

  // Launch browser with GUI visible
  const browser = await chromium.launch({ 
    headless: false,  // Show the browser window
    slowMo: 500       // Slightly slower for better interaction
  });
  
  const page = await browser.newPage();
  
  // Make the browser window larger
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Capture console logs for debugging
  page.on('console', msg => {
    console.log(`🎮 GAME LOG [${msg.type()}]: ${msg.text()}`);
  });
  
  // Capture any errors
  page.on('pageerror', error => {
    console.log(`❌ GAME ERROR: ${error.message}`);
  });
  
  console.log('🚀 Loading game...');
  
  // Navigate to the game
  await page.goto('http://localhost:5174');
  
  console.log('📄 Game loaded, waiting for initialization...');
  
  // Wait for game to load
  await page.waitForTimeout(3000);
  
  console.log('🖱️ Clicking canvas to start game...');
  
  // Try to start the game by clicking the canvas
  try {
    await page.click('canvas', { force: true });
    console.log('✅ Canvas clicked - game should be starting');
  } catch (e) {
    console.log('❌ Canvas click failed, trying center click...');
    await page.mouse.click(600, 400);
    console.log('✅ Clicked at center coordinates');
  }
  
  // Wait for game to initialize
  await page.waitForTimeout(2000);
  
  console.log('📸 Starting screenshot capture (1 per second)...');
  console.log('⏹️  Press Ctrl+C to stop capture');
  
  let screenshotCount = 0;
  const startTime = Date.now();
  
  // Set up interval to capture screenshots every second
  const screenshotInterval = setInterval(async () => {
    try {
      screenshotCount++;
      const timestamp = Date.now();
      const elapsed = Math.floor((timestamp - startTime) / 1000);
      const filename = `game-${screenshotCount.toString().padStart(4, '0')}-${elapsed}s.png`;
      const screenshotPath = path.join(tempDir, filename);
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: false  // Only capture viewport
      });
      
      console.log(`📸 Screenshot ${screenshotCount}: ${filename} (${elapsed}s elapsed)`);
    } catch (error) {
      console.log(`❌ Screenshot failed: ${error.message}`);
    }
  }, 1000); // Every 1000ms = 1 second
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping screenshot capture...');
    clearInterval(screenshotInterval);
    
    console.log(`📊 Captured ${screenshotCount} screenshots in ${tempDir}`);
    console.log('🔒 Closing browser...');
    await browser.close();
    
    console.log('✅ Screenshot capture complete!');
    process.exit(0);
  });
  
  // Optional: Test some game interactions while capturing
  console.log('🎮 Testing game interactions...');
  
  // Wait a bit then test some inputs
  setTimeout(async () => {
    try {
      console.log('⚡ Testing space bar (lightning weapon)...');
      await page.keyboard.press('Space');
      
      setTimeout(async () => {
        console.log('🏃 Testing movement keys...');
        await page.keyboard.press('KeyW');
        await page.waitForTimeout(500);
        await page.keyboard.press('KeyA');
        await page.waitForTimeout(500);
        await page.keyboard.press('KeyS');
        await page.waitForTimeout(500);
        await page.keyboard.press('KeyD');
      }, 3000);
      
      setTimeout(async () => {
        console.log('⚡ Testing lightning weapon again...');
        await page.keyboard.press('Space');
      }, 8000);
      
    } catch (error) {
      console.log(`❌ Game interaction failed: ${error.message}`);
    }
  }, 5000);
  
  // Keep the script running until manually stopped
  // The screenshot interval will continue until Ctrl+C
  console.log('🔄 Screenshot capture running... Press Ctrl+C to stop');
}

// Start the screenshot capture
captureScreenshotsEverySecond().catch(console.error);
