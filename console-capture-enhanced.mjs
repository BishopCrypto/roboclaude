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
  
  // Variable to track if we should auto-close
  let shouldAutoClose = false;
  
  // Capture console logs and look for close signal
  page.on('console', msg => {
    const text = msg.text();
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${text}`);
    
    // Detect the close signal
    if (text.includes('PLAYWRIGHT_CLOSE_SIGNAL') || text.includes('DOUBLE ESC DETECTED')) {
      console.log('🔔 CLOSE SIGNAL DETECTED! Browser will close in 2 seconds...');
      shouldAutoClose = true;
      setTimeout(async () => {
        console.log('🔒 Auto-closing browser due to double ESC...');
        await browser.close();
        console.log('✅ Browser closed automatically.');
        process.exit(0);
      }, 2000);
    }
  });
  
  // Capture any errors
  page.on('pageerror', error => {
    console.log(`BROWSER ERROR: ${error.message}`);
  });
  
  // Listen for custom events that might signal close
  await page.addInitScript(() => {
    window.addEventListener('doubleEscapePressed', (event) => {
      console.log('CUSTOM_EVENT_CLOSE_SIGNAL:', event.detail);
    });
  });
  
  console.log('🚀 Opening browser window...');
  console.log('📋 CONTROLS:');
  console.log('   - Click canvas to start game');
  console.log('   - ESC once = pause game');
  console.log('   - ESC twice = close browser (auto-detected)');
  console.log('   - Shift+ESC = manual close');
  console.log('   - Space = lightning weapon');
  console.log('   - WASD/Arrows = movement');
  
  // Navigate to the game
  await page.goto('http://localhost:5174');
  
  console.log('📄 Page loaded, waiting for you to see it...');
  
  // Wait longer for you to see the page
  await page.waitForTimeout(5000);
  
  console.log('🖱️ Attempting to click canvas to start game...');
  
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
  for (let i = 0; i < 3; i++) {
    console.log(`🔥 Pressing space (attempt ${i + 1})...`);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);  // Slower for visibility
  }
  
  console.log('🎮 Testing movement keys...');
  await page.keyboard.press('KeyW');
  await page.waitForTimeout(1000);
  await page.keyboard.press('KeyA');
  await page.waitForTimeout(1000);
  
  console.log('⏸️ Testing ESC key (should pause game)...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2000);
  
  console.log('🔄 Click canvas to unpause...');
  await page.click('canvas', { force: true });
  await page.waitForTimeout(2000);
  
  console.log('✅ Browser is now open for manual testing.');
  console.log('🔔 Try pressing ESC twice quickly to test auto-close!');
  
  // Manual close with Shift+ESC
  await page.evaluate(() => {
    document.addEventListener('keydown', (event) => {
      if (event.shiftKey && event.key === 'Escape') {
        console.log('🔒 Manual close requested (Shift+ESC)');
        console.log('PLAYWRIGHT_CLOSE_SIGNAL: Manual close via Shift+ESC');
      }
    });
  });
  
  // Wait indefinitely unless auto-close is triggered
  const startTime = Date.now();
  while (!shouldAutoClose) {
    await page.waitForTimeout(1000);
    
    // Optional: Auto-close after 60 seconds of no activity
    if (Date.now() - startTime > 60000) {
      console.log('⏰ Auto-closing after 60 seconds...');
      break;
    }
  }
  
  if (!shouldAutoClose) {
    console.log('🔒 Closing browser (timeout)...');
    await browser.close();
    console.log('✅ Browser closed.');
  }
}

captureConsoleLogs().catch(console.error);
