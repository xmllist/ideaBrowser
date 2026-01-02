require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const http = require('http');
const TurndownService = require('turndown');
const { PDFDocument } = require('pdf-lib');

// Login Credentials (from environment variables)
const LOGIN = {
  EMAIL: process.env.LOGIN_EMAIL,
  PASSWORD: process.env.LOGIN_PASSWORD,
  LOGIN_URL: 'https://www.ideabrowser.com/login'
};

// Cookies file path for persistence
const COOKIES_FILE = path.join(__dirname, 'cookies.json');

// Get idea URL from command line argument or use default
const DEFAULT_IDEA_URL = 'https://www.ideabrowser.com/idea-of-the-day';
const cliIdeaUrl = process.argv[2];

// Configuration
const CONFIG = {
  IDEA_OF_THE_DAY_URL: cliIdeaUrl || DEFAULT_IDEA_URL,
  START_URL: null,
  IDEA_SLUG: null,
  MAX_DEPTH: 5,
  BASE_OUTPUT_DIR: './crawler_output',
  OUTPUT_DIR: null,
  IMAGES_DIR: null,
  SCREENSHOTS_DIR: null,
  TIMEOUT: 60000,
  DELAY_BETWEEN_REQUESTS: 1500,
  COOKIES: [
    { name: '_fbp', value: 'fb.1.1759819141092.203005946488196065', domain: '.ideabrowser.com' },
    { name: '__stripe_mid', value: '3cfd962c-81eb-42e8-9caf-ac6df33ca8fd18fa49', domain: '.www.ideabrowser.com' },
    { name: 'sb-chqfunawciniepaqtdbd-auth-token.0', value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SW5aMlVGTmtOMmQwUmxWU1dIVkVSa1VpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJOb2NXWjFibUYzWTJsdWFXVndZWEYwWkdKa0xuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSmtPRFUyTjJJNVl5MWxOMkUzTFRRNFkyWXRZV05oWXkwMk9HVXhPV1E0WlRNMFpURWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZMU5ETXlNVEUzTENKcFlYUWlPakUzTmpVME1qZzFNVGNzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0p3YUc5dVpTSTZJaUlzSW1Gd2NGOXRaWFJoWkdGMFlTSTZleUp3Y205MmFXUmxjaUk2SW1kdmIyZHNaU0lzSW5CeWIzWnBaR1Z5Y3lJNld5Sm5iMjluYkdVaVhYMHNJblZ6WlhKZmJXVjBZV1JoZEdFaU9uc2lZWFpoZEdGeVgzVnliQ0k2SW1oMGRIQnpPaTh2YkdnekxtZHZiMmRzWlhWelpYSmpiMjUwWlc1MExtTnZiUzloTDBGRFp6aHZZMHR2TUhwUk1sVXlURFpVZW5BMU0weHZOSGRDZG5ORE1uZDRjVzFXVFZsUVoybzJSM1J3TmxWd1ptbE1ObmsxUVQxek9UWXRZeUlzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0psYldGcGJGOTJaWEpwWm1sbFpDSTZkSEoxWlN3aVpuVnNiRjl1WVcxbElqb2lSbUZ0YVd4NUlGUm9jbVZsSWl3aWFYTnpJam9pYUhSMGNITTZMeTloWTJOdmRXNTBjeTVuYjI5bmJHVXVZMjl0SWl3aWJtRnRaU0k2SWtaaGJXbHNlU0JVYUhKbFpTSXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWNHbGpkSFZ5WlNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB0dk1IcFJNbFV5VERaVWVuQTFNMHh2TkhkQ2RuTkRNbmQ0Y1cxV1RWbFFaMm8yUjNSd05sVndabWxNTm5rMVFUMXpPVFl0WXlJc0luQnliM1pwWkdWeVgybGtJam9pTVRBNU56WTNNekV5TURFM016UXhNRGN4TXpnMklpd2ljM1ZpSWpvaU1UQTVOelkzTXpFeU1ERTNNelF4TURjeE16ZzJJbjBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pYjJGMWRHZ2lMQ0owYVcxbGMzUmhiWEFpT2pFM05UazRNVGswTXpWOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpJd05XVTJPVGczTFRZd05tUXRORFF5T1MwNFpURTNMVFExTXpkbU5tSXhaVGxsWkNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuMkc3bmVERE41N0pCM1dUT1FSQUdMRW93blJPU0ZVcFR3UW5uNGp1MURpZyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzY1NDMyMTE3LCJyZWZyZXNoX3Rva2VuIjoienh3NGJtaWF2cW40IiwidXNlciI6eyJpZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF9jb25maXJtZWRfYXQiOiIyMDI1LTEwLTA2VDExOjQzOjAyLjUyMzY4MloiLCJwaG9uZSI6IiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTIzNjgyWiIsInJlY292ZXJ5X3NlbnRfYXQiOiIyMDI1LTEwLTI0VDA3OjEyOjUxLjE2MTIxOVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTEwLTI0VDA3OjEzOjA4LjU2MTY1OVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkZhbWlseSBUaHJlZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJGYW1pbHkgVGhyZWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiIsInN1YiI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6ImUxY2VlMzdkLWZkYmUtNDRiMC04MWI2LTlmY2RiZjcyOWNmYiIsImlkIjoiMTA5NzY3MzEyMDE3MzQxMDcxM', domain: 'www.ideabrowser.com' },
    { name: 'sb-chqfunawciniepaqtdbd-auth-token.1', value: 'zg2IiwidXNlcl9pZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiRmFtaWx5IFRocmVlIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IkZhbWlseSBUaHJlZSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2Iiwic3ViIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2In0sInByb3ZpZGVyIjoiZ29vZ2xlIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTc3NTNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTE3ODA2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTEwLTA3VDA2OjQzOjU0Ljk4ODUwNVoiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTI4OThaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMTFUMDQ6NDg6MzcuNjM0NloiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0', domain: 'www.ideabrowser.com' },
    { name: 'ph_phc_IZXZuHEQ1OVlUpri2j4r0IBHnngcGRaPMBcGChJc9p9_posthog', value: '%7B%22distinct_id%22%3A%220199bd65-0dcd-753e-8027-3aa28d24c8e3%22%2C%22%24sesid%22%3A%5B1765428649499%2C%22019b0bb4-ec3f-7df0-bfd0-36ec7390311d%22%2C1765427964991%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.ideabrowser.com%2F%22%7D%7D', domain: '.ideabrowser.com' }
  ],
  HEADERS: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
  }
};

class IdeaCrawler {
  constructor() {
    this.browser = null;
    this.visitedUrls = new Set();
    this.pageData = new Map();
    this.imageMap = new Map();
    this.imageCounter = 0;
    this.screenshotPaths = [];
    this.cookies = CONFIG.COOKIES; // Will be updated after login
  }

  // Load cookies from file
  loadCookies() {
    try {
      if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
        console.log('   📂 Loaded cookies from file');
        return cookies;
      }
    } catch (e) {
      console.log('   ⚠️  Could not load cookies file');
    }
    return CONFIG.COOKIES;
  }

  // Save cookies to file
  saveCookies(cookies) {
    try {
      fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
      console.log('   💾 Saved cookies to file');
    } catch (e) {
      console.log('   ⚠️  Could not save cookies');
    }
  }

  // Check if we're logged in
  async isLoggedIn(page) {
    const currentUrl = page.url();
    // If on login page, not logged in
    if (currentUrl.includes('/login')) {
      return false;
    }
    // Check for login button or user avatar
    const hasLoginButton = await page.evaluate(() => {
      const loginLinks = document.querySelectorAll('a[href*="/login"], button:contains("Login"), button:contains("Sign in")');
      return loginLinks.length > 0;
    });
    return !hasLoginButton;
  }

  // Perform login with email/password
  async performLogin() {
    console.log('\n🔐 Performing login...');
    const page = await this.browser.newPage();
    await page.setExtraHTTPHeaders(CONFIG.HEADERS);

    try {
      // Set viewport
      await page.setViewport({ width: 1440, height: 900 });

      // Navigate to login page
      await page.goto(LOGIN.LOGIN_URL, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot to see login page structure
      if (!fs.existsSync(CONFIG.BASE_OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.BASE_OUTPUT_DIR, { recursive: true });
      }
      await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_page.png'), fullPage: true });
      console.log('   📸 Screenshot saved: login_page.png');

      // Log page URL and check for redirects
      console.log(`   📍 Current URL: ${page.url()}`);

      console.log(`   📧 Logging in as: ${LOGIN.EMAIL}`);

      // Step 1: Click "Sign in with Password" FIRST to reveal password field
      console.log('   🔄 Clicking "Sign in with Password"...');

      // Use evaluate to dispatch all required events including PointerEvent
      const clickResult = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent.trim() === 'Sign in with Password') {
            // Check if button is visible (has dimensions)
            const rect = btn.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              continue; // Skip hidden buttons
            }
            btn.scrollIntoView({ block: 'center' });
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Dispatch PointerEvent (used by modern React)
            const pointerDownEvt = new PointerEvent('pointerdown', {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true
            });
            const pointerUpEvt = new PointerEvent('pointerup', {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true
            });

            // Dispatch MouseEvent
            const mouseDownEvt = new MouseEvent('mousedown', {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, button: 0
            });
            const mouseUpEvt = new MouseEvent('mouseup', {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, button: 0
            });
            const clickEvt = new MouseEvent('click', {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, button: 0
            });

            // Fire all events in proper order
            btn.dispatchEvent(pointerDownEvt);
            btn.dispatchEvent(mouseDownEvt);
            btn.dispatchEvent(pointerUpEvt);
            btn.dispatchEvent(mouseUpEvt);
            btn.dispatchEvent(clickEvt);

            return { success: true, x, y };
          }
        }
        return { success: false };
      });

      if (!clickResult.success) {
        throw new Error('"Sign in with Password" button not found');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if password field appeared
      let passwordVisible = await page.evaluate(() => {
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
          const rect = passwordInput.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0;
        }
        return false;
      });

      // If still not visible, try using Puppeteer's native click
      if (!passwordVisible) {
        console.log('   ⚠️  Trying native click...');

        // Find the button element handle and click it
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent.trim(), button);
          if (text === 'Sign in with Password') {
            await button.evaluate(el => el.scrollIntoView({ block: 'center' }));
            await new Promise(resolve => setTimeout(resolve, 300));

            const box = await button.boundingBox();
            if (box) {
              await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            break;
          }
        }
      }

      console.log('   ✅ Clicked button');

      // Take screenshot after clicking to verify
      await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_after_button_click.png'), fullPage: true });

      // Verify password field appeared - check if it's visible, not just exists
      passwordVisible = await page.evaluate(() => {
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
          const rect = passwordInput.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0;
        }
        return false;
      });

      if (passwordVisible) {
        console.log('   ✅ Password field revealed');
      } else {
        await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_no_password_field.png'), fullPage: true });
        throw new Error('Password field did not appear after clicking button');
      }

      // Step 2: Fill email using page.type() for proper React compatibility
      // Find and click the visible email input, then type
      const emailInputs = await page.$$('input[type="email"]');
      let emailFilled = false;
      for (const input of emailInputs) {
        const box = await input.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          await input.click({ clickCount: 3 }); // Select all existing text
          await input.type(LOGIN.EMAIL, { delay: 50 });
          emailFilled = true;
          console.log('   ✅ Email filled');
          break;
        }
      }

      if (!emailFilled) {
        throw new Error('Email input not found');
      }

      // Step 3: Fill password using page.type()
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        const box = await passwordInput.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          await passwordInput.click();
          await passwordInput.type(LOGIN.PASSWORD, { delay: 50 });
          console.log('   ✅ Password filled');
        } else {
          throw new Error('Password input not visible');
        }
      } else {
        await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_no_password.png'), fullPage: true });
        throw new Error('Password input not found');
      }

      // Take screenshot before submit to verify fields are filled
      await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_before_submit.png'), fullPage: true });
      console.log('   📸 Screenshot saved: login_before_submit.png');

      // Step 4: Submit login by clicking "Sign in with Password" button
      console.log('   🔄 Submitting login...');

      // Find the visible "Sign in with Password" button and click with real mouse
      const allButtons = await page.$$('button');
      let submitClicked = false;
      for (const button of allButtons) {
        const text = await page.evaluate(el => el.textContent.trim(), button);
        if (text === 'Sign in with Password') {
          const box = await button.boundingBox();
          if (box && box.width > 0 && box.height > 0) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            submitClicked = true;
            break;
          }
        }
      }

      if (!submitClicked) {
        console.log('   ⚠️  Submit button not found, pressing Enter...');
        await page.keyboard.press('Enter');
      }

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot after submit
      await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_after_submit.png'), fullPage: true });
      console.log('   📸 Screenshot saved: login_after_submit.png');

      // Check for error messages on page
      const errorMsg = await page.evaluate(() => {
        const errorEl = document.querySelector('[role="alert"], .error, .text-red-500, .text-destructive');
        return errorEl ? errorEl.textContent : null;
      });
      if (errorMsg) {
        console.log(`   ⚠️  Error message: ${errorMsg.trim()}`);
      }

      // Check if login was successful
      const currentUrl = page.url();
      console.log(`   📍 After submit URL: ${currentUrl}`);
      if (currentUrl.includes('/login')) {
        throw new Error('Login failed - still on login page');
      }

      // Get cookies after login
      const cookies = await page.cookies();
      this.saveCookies(cookies);
      console.log('   ✅ Login successful!');

      await page.close();
      return cookies;
    } catch (error) {
      console.log(`   ❌ Login error: ${error.message}`);
      // Take screenshot for debugging
      await page.screenshot({ path: path.join(CONFIG.BASE_OUTPUT_DIR, 'login_error.png'), fullPage: true });
      await page.close();
      throw error;
    }
  }

  // Ensure we're logged in, login if needed
  async ensureLoggedIn() {
    console.log('\n🔑 Checking authentication...');
    const page = await this.browser.newPage();

    // Try with saved/default cookies first
    const cookies = this.loadCookies();
    await page.setCookie(...cookies);
    await page.setExtraHTTPHeaders(CONFIG.HEADERS);

    // Navigate to a protected page to check auth
    await page.goto(CONFIG.IDEA_OF_THE_DAY_URL, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const currentUrl = page.url();

    // Check if redirected to login
    if (currentUrl.includes('/login')) {
      console.log('   ⚠️  Session expired, need to login');
      await page.close();

      // Perform login
      const newCookies = await this.performLogin();
      return newCookies;
    }

    console.log('   ✅ Already authenticated');
    await page.close();
    return cookies;
  }

  // Extract idea slug from URL
  extractIdeaSlug(ideaUrl) {
    try {
      const urlObj = new url.URL(ideaUrl);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length >= 2 && pathParts[0] === 'idea') {
        return pathParts[1];
      }
      return null;
    } catch {
      return null;
    }
  }

  // Initialize browser
  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser initialized');
  }

  // Create output directories
  createOutputDirectories() {
    console.log(`\n📁 Creating output directories for: ${CONFIG.IDEA_SLUG}`);

    CONFIG.OUTPUT_DIR = path.join(CONFIG.BASE_OUTPUT_DIR, CONFIG.IDEA_SLUG);
    CONFIG.IMAGES_DIR = path.join(CONFIG.OUTPUT_DIR, 'images');
    CONFIG.SCREENSHOTS_DIR = path.join(CONFIG.OUTPUT_DIR, 'screenshots');

    [CONFIG.OUTPUT_DIR, CONFIG.IMAGES_DIR, CONFIG.SCREENSHOTS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    console.log(`   📂 ${CONFIG.OUTPUT_DIR}`);
  }

  // Detect idea of the day URL
  async detectIdeaOfTheDay() {
    console.log('\n🔍 Detecting Idea of the Day...');
    console.log(`   Navigating to: ${CONFIG.IDEA_OF_THE_DAY_URL}`);

    const page = await this.browser.newPage();
    await page.setCookie(...this.cookies);
    await page.setExtraHTTPHeaders(CONFIG.HEADERS);
    await page.goto(CONFIG.IDEA_OF_THE_DAY_URL, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentUrl = page.url();

    // Check if redirected to idea page
    if (currentUrl.includes('/idea/') && !currentUrl.includes('idea-of-the-day')) {
      const pathParts = new url.URL(currentUrl).pathname.split('/').filter(p => p);
      if (pathParts.length >= 2 && pathParts[0] === 'idea') {
        const baseUrl = `https://www.ideabrowser.com/idea/${pathParts[1]}`;
        console.log(`✅ Detected (redirect): ${baseUrl}`);
        await page.close();
        return baseUrl;
      }
    }

    // Find any idea link on the page
    const ideaUrl = await page.evaluate(() => {
      const ideaLinks = document.querySelectorAll('a[href*="/idea/"]');
      for (const link of ideaLinks) {
        const href = link.href;
        if (href.includes('/idea/') && !href.includes('idea-of-the-day')) {
          return href;
        }
      }
      return null;
    });

    await page.close();

    if (ideaUrl) {
      // Extract base idea URL (remove sub-paths like /build/landing-page)
      const urlObj = new url.URL(ideaUrl);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length >= 2 && pathParts[0] === 'idea') {
        const baseUrl = `https://www.ideabrowser.com/idea/${pathParts[1]}`;
        console.log(`✅ Detected: ${baseUrl}`);
        return baseUrl;
      }
    }

    throw new Error('Could not detect Idea of the Day URL');
  }

  // Check if URL belongs to the current idea
  isIdeaUrl(targetUrl) {
    if (!targetUrl || !CONFIG.IDEA_SLUG) return false;

    // Must be an idea URL and contain our slug
    if (!targetUrl.includes('/idea/')) return false;

    // Extract the slug from the target URL and compare
    try {
      const urlObj = new url.URL(targetUrl);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length >= 2 && pathParts[0] === 'idea') {
        // The slug is the second part (after 'idea')
        return pathParts[1] === CONFIG.IDEA_SLUG;
      }
    } catch {
      // Fallback to simple includes check
      return targetUrl.includes(CONFIG.IDEA_SLUG);
    }
    return false;
  }

  // Download image
  async downloadImage(imageUrl) {
    try {
      if (this.imageMap.has(imageUrl)) return this.imageMap.get(imageUrl);

      const imageNumber = ++this.imageCounter;
      const ext = path.extname(new url.URL(imageUrl).pathname) || '.jpg';
      const filename = `image_${imageNumber}${ext}`;
      const filepath = path.join(CONFIG.IMAGES_DIR, filename);

      await new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http;
        protocol.get(imageUrl, { timeout: 5000 }, (res) => {
          if (res.statusCode === 200) {
            res.pipe(fs.createWriteStream(filepath)).on('finish', resolve).on('error', reject);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }).on('error', reject);
      });

      this.imageMap.set(imageUrl, { filename, filepath });
      return { filename, filepath };
    } catch (error) {
      return null;
    }
  }

  // Crawl a single page
  async crawlPage(pageUrl, depth = 0) {
    if (depth > CONFIG.MAX_DEPTH || this.visitedUrls.has(pageUrl) || !this.isIdeaUrl(pageUrl)) {
      return [];
    }

    this.visitedUrls.add(pageUrl);
    const pageNum = this.visitedUrls.size;
    console.log(`   [${pageNum}] Crawling: ${pageUrl}`);

    try {
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.setCookie(...this.cookies);
      await page.setExtraHTTPHeaders(CONFIG.HEADERS);
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
      await page.waitForSelector('body', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Take screenshot
      const screenshotPath = path.join(CONFIG.SCREENSHOTS_DIR, `page_${String(pageNum).padStart(3, '0')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, type: 'png' });
      this.screenshotPaths.push(screenshotPath);

      // Extract page data
      const pageTitle = await page.title();
      const pageContent = await page.evaluate(() => {
        document.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach(el => el.remove());
        const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
        return main ? main.innerHTML : document.body.innerHTML;
      });

      // Download images
      const images = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, alt: img.alt || 'Image' })));
      const downloadedImages = [];
      for (const img of images) {
        if (img.src) {
          const downloaded = await this.downloadImage(img.src);
          if (downloaded) downloadedImages.push({ ...img, ...downloaded });
        }
      }

      this.pageData.set(pageUrl, {
        title: pageTitle,
        html: pageContent,
        url: pageUrl,
        depth,
        images: downloadedImages
      });

      // Extract links for further crawling
      const links = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(href => href));
      await page.close();

      // Debug: show all idea-related links found
      const ideaLinks = links.filter(link => link.includes('/idea/'));
      if (ideaLinks.length > 0) {
        console.log(`      📎 Found ${ideaLinks.length} idea links on page:`);
        // Show unique paths (remove duplicates)
        const uniquePaths = [...new Set(ideaLinks.map(l => {
          try {
            return new url.URL(l).pathname;
          } catch {
            return l;
          }
        }))];
        uniquePaths.slice(0, 10).forEach(p => console.log(`         - ${p}`));
        if (uniquePaths.length > 10) {
          console.log(`         ... and ${uniquePaths.length - 10} more`);
        }
      }

      // Crawl child pages
      const newLinks = links.filter(link => !this.visitedUrls.has(link) && this.isIdeaUrl(link));
      if (newLinks.length > 0) {
        console.log(`      🔗 Will crawl ${newLinks.length} new sub-pages`);
      } else if (ideaLinks.length > 0) {
        // Debug: show why links didn't match
        console.log(`      ⚠️  No matching sub-pages (already visited or different idea)`);
      }

      await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));

      for (const childUrl of newLinks) {
        await this.crawlPage(childUrl, depth + 1);
      }

      return [pageUrl];
    } catch (error) {
      console.error(`      ❌ Error: ${error.message}`);
      return [];
    }
  }

  // Export to Markdown
  async exportToMarkdown() {
    console.log('\n📝 Exporting to Markdown...');

    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    turndownService.remove(['script', 'style', 'noscript', 'svg', 'head', 'meta', 'link']);

    let markdown = `# ${CONFIG.IDEA_SLUG}\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n`;
    markdown += `Total pages: ${this.pageData.size}\n\n---\n\n`;

    const sortedPages = Array.from(this.pageData.values())
      .sort((a, b) => a.depth !== b.depth ? a.depth - b.depth : a.url.localeCompare(b.url));

    for (const pageData of sortedPages) {
      markdown += `## ${pageData.title}\n\n`;
      markdown += `**URL:** [${pageData.url}](${pageData.url})\n\n`;

      try {
        markdown += turndownService.turndown(pageData.html) + '\n\n';
      } catch {
        markdown += '*Content could not be converted*\n\n';
      }

      if (pageData.images?.length > 0) {
        markdown += '### Images\n\n';
        for (const img of pageData.images) {
          markdown += `![${img.alt}](./images/${img.filename})\n`;
        }
        markdown += '\n';
      }

      markdown += '---\n\n';
    }

    const mdPath = path.join(CONFIG.OUTPUT_DIR, `${CONFIG.IDEA_SLUG}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`   ✅ Saved: ${mdPath}`);
    return mdPath;
  }

  // Merge screenshots to PDF
  async exportToPdf() {
    console.log('\n📄 Merging screenshots to PDF...');

    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < this.screenshotPaths.length; i++) {
      const screenshotPath = this.screenshotPaths[i];
      console.log(`   [${i + 1}/${this.screenshotPaths.length}] Adding: ${path.basename(screenshotPath)}`);

      try {
        const imageBytes = fs.readFileSync(screenshotPath);
        const image = await pdfDoc.embedPng(imageBytes);
        const { width, height } = image.scale(1);

        const maxWidth = 595; // A4 width
        const scale = maxWidth / width;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        const page = pdfDoc.addPage([scaledWidth, scaledHeight]);
        page.drawImage(image, { x: 0, y: 0, width: scaledWidth, height: scaledHeight });
      } catch (error) {
        console.error(`      ❌ Error: ${error.message}`);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(CONFIG.OUTPUT_DIR, `${CONFIG.IDEA_SLUG}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log(`   ✅ Saved: ${pdfPath}`);
    return pdfPath;
  }

  // Main run method
  async run() {
    try {
      console.log('🕷️  Idea Crawler Started\n');
      console.log('='.repeat(50));

      if (cliIdeaUrl) {
        console.log(`📌 Using provided URL: ${cliIdeaUrl}`);
      } else {
        console.log(`📌 Using default: ${DEFAULT_IDEA_URL}`);
      }

      await this.initialize();

      // Force login every time
      this.cookies = await this.performLogin();

      // Detect idea of the day
      CONFIG.START_URL = await this.detectIdeaOfTheDay();
      CONFIG.IDEA_SLUG = this.extractIdeaSlug(CONFIG.START_URL);

      // Create output directories
      this.createOutputDirectories();

      console.log(`\n📌 Idea: ${CONFIG.IDEA_SLUG}`);
      console.log(`🔗 URL: ${CONFIG.START_URL}`);
      console.log(`📊 Max depth: ${CONFIG.MAX_DEPTH}\n`);

      // Crawl all pages
      console.log('🕸️  Crawling pages...');
      await this.crawlPage(CONFIG.START_URL, 0);

      console.log(`\n✅ Crawled ${this.visitedUrls.size} pages`);
      console.log(`📸 Captured ${this.screenshotPaths.length} screenshots`);
      console.log(`🖼️  Downloaded ${this.imageCounter} images`);

      // Export
      await this.exportToMarkdown();
      await this.exportToPdf();

      console.log('\n' + '='.repeat(50));
      console.log('🎉 Done!');
      console.log(`📁 Output: ${CONFIG.OUTPUT_DIR}`);

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
    } finally {
      if (this.browser) await this.browser.close();
    }
  }
}

// Run
const crawler = new IdeaCrawler();
crawler.run().catch(console.error);
