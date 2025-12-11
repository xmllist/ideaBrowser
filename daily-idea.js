const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const http = require('http');
const TurndownService = require('turndown');
const { PDFDocument } = require('pdf-lib');

// Telegram Configuration
const TELEGRAM = {
  BOT_TOKEN: '8559272871:AAHQ6AjXLTkTM0L9b9Lk7qKySg6-AFCWBpA',
  CHAT_ID: '413608487'
};

// Crawler Configuration
const CONFIG = {
  IDEA_OF_THE_DAY_URL: 'https://www.ideabrowser.com/idea-of-the-day',
  START_URL: null,
  IDEA_SLUG: null,
  MAX_DEPTH: 1,
  BASE_OUTPUT_DIR: './crawler_output',
  OUTPUT_DIR: null,
  IMAGES_DIR: null,
  SCREENSHOTS_DIR: null,
  TIMEOUT: 60000,
  DELAY_BETWEEN_REQUESTS: 1500,
  COOKIES: [
    { name: '_fbp', value: 'fb.1.1759819141092.203005946488196065', domain: '.ideabrowser.com' },
    { name: '__stripe_mid', value: '3cfd962c-81eb-42e8-9caf-ac6df33ca8fd18fa49', domain: '.www.ideabrowser.com' },
    { name: 'sb-chqfunawciniepaqtdbd-auth-token.0', value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SW5aMlVGTmtOMmQwUmxWU1dIVkVSa1VpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJOb2NXWjFibUYzWTJsdWFXVndZWEYwWkdKa0xuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSmtPRFUyTjJJNVl5MWxOMkUzTFRRNFkyWXRZV05oWXkwMk9HVXhPV1E0WlRNMFpURWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZMU5EVXdOVGt6TENKcFlYUWlPakUzTmpVME5EWTVPVE1zSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0p3YUc5dVpTSTZJaUlzSW1Gd2NGOXRaWFJoWkdGMFlTSTZleUp3Y205MmFXUmxjaUk2SW1kdmIyZHNaU0lzSW5CeWIzWnBaR1Z5Y3lJNld5Sm5iMjluYkdVaVhYMHNJblZ6WlhKZmJXVjBZV1JoZEdFaU9uc2lZWFpoZEdGeVgzVnliQ0k2SW1oMGRIQnpPaTh2YkdnekxtZHZiMmRzWlhWelpYSmpiMjUwWlc1MExtTnZiUzloTDBGRFp6aHZZMHR2TUhwUk1sVXlURFpVZW5BMU0weHZOSGRDZG5ORE1uZDRjVzFXVFZsUVoybzJSM1J3TmxWd1ptbE1ObmsxUVQxek9UWXRZeUlzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0psYldGcGJGOTJaWEpwWm1sbFpDSTZkSEoxWlN3aVpuVnNiRjl1WVcxbElqb2lSbUZ0YVd4NUlGUm9jbVZsSWl3aWFYTnpJam9pYUhSMGNITTZMeTloWTJOdmRXNTBjeTVuYjI5bmJHVXVZMjl0SWl3aWJtRnRaU0k2SWtaaGJXbHNlU0JVYUhKbFpTSXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWNHbGpkSFZ5WlNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB0dk1IcFJNbFV5VERaVWVuQTFNMHh2TkhkQ2RuTkRNbmQ0Y1cxV1RWbFFaMm8yUjNSd05sVndabWxNTm5rMVFUMXpPVFl0WXlJc0luQnliM1pwWkdWeVgybGtJam9pTVRBNU56WTNNekV5TURFM016UXhNRGN4TXpnMklpd2ljM1ZpSWpvaU1UQTVOelkzTXpFeU1ERTNNelF4TURjeE16ZzJJbjBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pYjJGMWRHZ2lMQ0owYVcxbGMzUmhiWEFpT2pFM05qVTBORFk1T1ROOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpCalpUa3hOV013TFdNNE1UZ3RORGc0WXkxaE1UTmxMVEptWXpWallqRmxabVU1TUNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuWktkQ1RIN2I2b25CQVYtZmZlLUVlWUtfQzNodklLZjh5NG9PQ3pNZTNDYyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzY1NDUwNTkzLCJyZWZyZXNoX3Rva2VuIjoicnJhNHczZ3lwZXU3IiwidXNlciI6eyJpZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF9jb25maXJtZWRfYXQiOiIyMDI1LTEwLTA2VDExOjQzOjAyLjUyMzY4MloiLCJwaG9uZSI6IiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTIzNjgyWiIsInJlY292ZXJ5X3NlbnRfYXQiOiIyMDI1LTEwLTI0VDA3OjEyOjUxLjE2MTIxOVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTEyLTExVDA5OjU2OjMzLjAxMDA4ODgwOFoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkZhbWlseSBUaHJlZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJGYW1pbHkgVGhyZWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiIsInN1YiI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6ImUxY2VlMzdkLWZkYmUtNDRiMC04MWI2LTlmY2RiZjcyOWNmYiIsImlkIjoiMTA5NzY3MzEyMDE3MzQxM', domain: 'www.ideabrowser.com' },
    { name: 'sb-chqfunawciniepaqtdbd-auth-token.1', value: 'DcxMzg2IiwidXNlcl9pZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiRmFtaWx5IFRocmVlIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IkZhbWlseSBUaHJlZSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2Iiwic3ViIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2In0sInByb3ZpZGVyIjoiZ29vZ2xlIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTc3NTNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTE3ODA2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTEyLTExVDA5OjU2OjMyLjY0MjAxN1oiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTI4OThaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMTFUMDk6NTY6MzMuMDMyNzczWiIsImlzX2Fub255bW91cyI6ZmFsc2V9LCJwcm92aWRlcl90b2tlbiI6InlhMjkuQTBBYTdwQ0E5MkhwVXhNUjdIdzZydlRRaF9CV0NFR3lpNVJqVEFKSktiZG1Vc09NQ1Q4aXdkWDRBOWZTQWcxVzl5TmVTRUgzR21ENFhHbk5heWlveUdQb2JZTzg5dU5yQzhzamRBR2xQWk9OVERtNHNOT1l2QTFoeFdRb1l1ZXNCMEJ0NlFSS28wTFhUNEp1SWxTU3MzdFRKbWUxSlBDN0c4dTBWLXB3LUxTN0w4SzRJSzB4QjIzWW9xeVhfdUdHLWo1aXZWUWhuT0hCa2kweF9KbWNUbGE4dHNmc3phWE92ZnVQam1GSS1lZWVtdW9kbW5ZNnJ0c0V5UVE0ZVZUNGh5WTcyYVBMd2llU2JhcjJmUXlpRDdzN2NQcWhVNEZ5a2FDZ1lLQVlzU0FSY1NGUUhHWDJNaWZPR3U2QTBCa1dBRTBENFJWWlBjNlEwMjk0In0', domain: 'www.ideabrowser.com' },
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

// Send document to Telegram
async function sendToTelegram(filePath, caption) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM.CHAT_ID}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM.BOT_TOKEN}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.ok) {
          resolve(response);
        } else {
          reject(new Error(response.description || 'Telegram API error'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Send message to Telegram
async function sendMessage(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM.CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM.BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

class IdeaCrawler {
  constructor() {
    this.browser = null;
    this.visitedUrls = new Set();
    this.pageData = new Map();
    this.imageMap = new Map();
    this.imageCounter = 0;
    this.screenshotPaths = [];
  }

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

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser initialized');
  }

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

  async detectIdeaOfTheDay() {
    console.log('\n🔍 Detecting Idea of the Day...');
    console.log(`   Navigating to: ${CONFIG.IDEA_OF_THE_DAY_URL}`);

    const page = await this.browser.newPage();
    await page.setCookie(...CONFIG.COOKIES);
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

  isIdeaUrl(targetUrl) {
    return targetUrl && CONFIG.IDEA_SLUG && targetUrl.includes(CONFIG.IDEA_SLUG);
  }

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
    } catch {
      return null;
    }
  }

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
      await page.setCookie(...CONFIG.COOKIES);
      await page.setExtraHTTPHeaders(CONFIG.HEADERS);
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
      await page.waitForSelector('body', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const screenshotPath = path.join(CONFIG.SCREENSHOTS_DIR, `page_${String(pageNum).padStart(3, '0')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, type: 'png' });
      this.screenshotPaths.push(screenshotPath);

      const pageTitle = await page.title();
      const pageContent = await page.evaluate(() => {
        document.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach(el => el.remove());
        const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
        return main ? main.innerHTML : document.body.innerHTML;
      });

      const images = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, alt: img.alt || 'Image' })));
      const downloadedImages = [];
      for (const img of images) {
        if (img.src) {
          const downloaded = await this.downloadImage(img.src);
          if (downloaded) downloadedImages.push({ ...img, ...downloaded });
        }
      }

      this.pageData.set(pageUrl, { title: pageTitle, html: pageContent, url: pageUrl, depth, images: downloadedImages });

      const links = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(href => href));
      await page.close();

      const newLinks = links.filter(link => !this.visitedUrls.has(link) && this.isIdeaUrl(link));
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
        const maxWidth = 595;
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

  async run() {
    const startTime = new Date();
    let pdfPath = null;

    try {
      console.log('🕷️  Daily Idea Crawler Started');
      console.log(`📅 ${startTime.toLocaleString()}\n`);
      console.log('='.repeat(50));

      await this.initialize();
      CONFIG.START_URL = await this.detectIdeaOfTheDay();
      CONFIG.IDEA_SLUG = this.extractIdeaSlug(CONFIG.START_URL);
      this.createOutputDirectories();

      console.log(`\n📌 Idea: ${CONFIG.IDEA_SLUG}`);
      console.log(`🔗 URL: ${CONFIG.START_URL}\n`);

      console.log('🕸️  Crawling pages...');
      await this.crawlPage(CONFIG.START_URL, 0);

      console.log(`\n✅ Crawled ${this.visitedUrls.size} pages`);
      console.log(`📸 Captured ${this.screenshotPaths.length} screenshots`);
      console.log(`🖼️  Downloaded ${this.imageCounter} images`);

      await this.exportToMarkdown();
      pdfPath = await this.exportToPdf();

      // Send to Telegram
      console.log('\n📤 Sending to Telegram...');
      const ideaName = CONFIG.IDEA_SLUG.replace(/-\d+$/, '').replace(/-/g, ' ');
      const caption = `📋 Idea of the Day\n\n🎯 ${ideaName}\n\n📅 ${startTime.toLocaleDateString()}\n📄 ${this.visitedUrls.size} pages`;

      await sendToTelegram(pdfPath, caption);
      console.log('   ✅ PDF sent to Telegram!');

      console.log('\n' + '='.repeat(50));
      console.log('🎉 Done!');

    } catch (error) {
      console.error('❌ Error:', error.message);

      // Send error notification to Telegram
      try {
        await sendMessage(`❌ Daily Idea Crawler Failed\n\n${error.message}\n\n📅 ${startTime.toLocaleString()}`);
      } catch {
        console.error('Failed to send error notification to Telegram');
      }
    } finally {
      if (this.browser) await this.browser.close();
    }
  }
}

// Run
const crawler = new IdeaCrawler();
crawler.run().catch(console.error);
