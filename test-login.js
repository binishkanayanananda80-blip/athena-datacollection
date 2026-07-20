const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set up logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Intercept requests to log them
  page.on('response', response => {
    const url = response.url();
    if (url.includes('localhost:3000') && !url.includes('_next/static')) {
      console.log(`${response.request().method()} ${url} ${response.status()}`);
    }
  });

  try {
    console.log("Navigating to login page...");
    await page.goto('http://localhost:3000/furniture-requirements', { waitUntil: 'networkidle2' });
    
    // Switch to Login Tab
    console.log("Switching to login tab...");
    // The tabs are controlled by Radix UI. They usually have role="tab" and value="login"
    await page.click('button[value="login"]');
    await new Promise(r => setTimeout(r, 500));
    
    console.log("Typing credentials...");
    await page.type('input[name="identifier"]', 'horana');
    await page.type('input[name="password"]', 'Password123!'); // Assuming the password they set
    
    console.log("Clicking login...");
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation to dashboard...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
    console.log("Current URL after login:", page.url());
    
    if (page.url().includes('dashboard')) {
      console.log("Successfully reached dashboard. Clicking Continue to Data Entry...");
      await page.click('a[href="/furniture-requirements/entry"]');
      
      console.log("Waiting for navigation...");
      await new Promise(r => setTimeout(r, 3000));
      console.log("Final URL:", page.url());
    } else {
      console.log("Did not reach dashboard. Current URL:", page.url());
    }

  } catch (e) {
    console.error("Test failed:", e.message);
  } finally {
    await browser.close();
  }
})();
