import { chromium } from 'playwright';

async function captureConsoleLogs() {
  // Launch browser with GUI visible
  const browser = await chromium.launch({ 
    headless: false,  // Show the browser window
    slowMo: 1000      // Slow down actions so you can see them
  });
  const page = await browser.newPage();
  
  // Make the browser window larger
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  // Capture any errors
  page.on('pageerror', error => {
    console.log(`BROWSER ERROR: ${error.message}`);
  });
  
  console.log('🚀 Opening browser window...');
  
  // Navigate to the game
  await page.goto('http://localhost:5174');
  
  console.log('📄 Page loaded, waiting for you to see it...');
  
  // Wait longer for you to see the page
  await page.waitForTimeout(5000);
  
  console.log('🖱️ Attempting to click canvas...');
  
  // Try to force click on the canvas to start the game
  try {
    await page.click('canvas', { force: true });
    console.log('✅ Canvas clicked (forced)');
  } catch (e) {
    console.log('❌ Canvas click failed, trying different approach...');
    // Try clicking on the entire canvas area
    await page.mouse.click(400, 300);
    console.log('✅ Clicked at center coordinates');
  }
  
  // Wait for game to initialize
  await page.waitForTimeout(3000);
  
  console.log('⚡ Testing lightning weapon - pressing space...');
  
  // Press space bar multiple times to test lightning
  for (let i = 0; i < 5; i++) {
    console.log(`🔥 Pressing space (attempt ${i + 1})...`);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);  // Slower for visibility
  }
  
  console.log('🎮 Testing movement keys...');
  await page.keyboard.press('KeyW');
  await page.waitForTimeout(1000);
  await page.keyboard.press('KeyA');
  await page.waitForTimeout(1000);
  
  console.log('⚡ Final space press...');
  await page.keyboard.press('Space');
  
  console.log('✅ Browser is now open for manual testing. Press Shift+ESC to close.');
  
  // Use Shift+ESC to close - much simpler and intuitive
  page.on('keydown', (event) => {
    if (event.shiftKey && event.key === 'Escape') {
      console.log('🔒 Closing browser...');
      browser.close();
      console.log('✅ Browser closed, console capture complete.');
    }
  });
  
  // Wait indefinitely - key combination handler will close the browser
  await new Promise(() => {});
}

captureConsoleLogs().catch(console.error);
