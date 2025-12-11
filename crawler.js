const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const http = require('http');
const TurndownService = require('turndown');

// Configuration
const CONFIG = {
  START_URL: 'https://www.ideabrowser.com/idea/budget-dashboard-for-sports-teams-that-shows-parents-real-time-spending-394/',
  MAX_DEPTH: 4,
  SAME_DOMAIN_ONLY: true,
  OUTPUT_DIR: './crawler_output',
  IMAGES_DIR: './crawler_output/images',
  TIMEOUT: 30000,
  DELAY_BETWEEN_REQUESTS: 1000,
  COOKIES: [
    {
      name: '_fbp',
      value: 'fb.1.1759819141092.203005946488196065',
      domain: '.ideabrowser.com'
    },
    {
      name: '__stripe_mid',
      value: '3cfd962c-81eb-42e8-9caf-ac6df33ca8fd18fa49',
      domain: '.ideabrowser.com'
    },
    {
      name: 'sb-chqfunawciniepaqtdbd-auth-token.0',
      value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SW5aMlVGTmtOMmQwUmxWU1dIVkVSa1VpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJOb2NXWjFibUYzWTJsdWFXVndZWEYwWkdKa0xuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSmtPRFUyTjJJNVl5MWxOMkUzTFRRNFkyWXRZV05oWXkwMk9HVXhPV1E0WlRNMFpURWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZMU5ETXlNVEUzTENKcFlYUWlPakUzTmpVME1qZzFNVGNzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0p3YUc5dVpTSTZJaUlzSW1Gd2NGOXRaWFJoWkdGMFlTSTZleUp3Y201MmFXUmxjaUk2SW1kdmIyZHNaU0lzSW5CeWIzWnBaR1Z5Y3lJNld5Sm5iMjluYkdVaVhYMHNJblZ6WlhKZmJXVjBZV1JoZEdFaU9uc2lZWFpoZEdGeVgzVnliQ0k2SW1oMGRIQnpPaTh2YkdnekxtZHZiMmRzWlhWelpYSmpiMjUwWlc1MExtTnZiUzloTDBGRFp6aHZZMHR2TUhwUk1sVXlURFpVZW5BMU0weHZOSGRDZG5ORE1uZDRjVzFXVFZsUVoybzJSM1J3TmxWd1ptbE1ObmsxUVQxek9UWXRZeUlzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0psYldGcGJGOTJaWEpwWm1sbFpDSTZkSEoxWlN3aVpuVnNiRjl1WVcxbElqb2lSbUZ0YVd4NUlGUm9jbVZsSWl3aWFYTnpJam9pYUhSMGNITTZMeTloWTJOdmRXNTBjeTVuYjI5bmJHVXVZMjl0SWl3aWJtRnRaU0k2SWtaaGJXbHNlU0JVYUhKbFpTSXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWNHbGpkSFZ5WlNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB0dk1IcFJNbFV5VERaVWVuQTFNMHh2TkhkQ2RuTkRNbmQ0Y1cxV1RWbFFaMm8yUjNSd05sVndabWxNTm5rMVFUMXpPVFl0WXlJc0luQnliM1pwWkdWeVgybGtJam9pTVRBNU56WTNNekV5TURFM016UXhNRGN4TXpnMklpd2ljM1ZpSWpvaU1UQTVOelkzTXpFeU1ERTNNelF4TURjeE16ZzJJbjBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pYjJGMWRHZ2lMQ0owYVcxbGMzUmhiWEFpT2pFM05UazRNVGswTXpWOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpJd05XVTJPVGczTFRZd05tUXRORFF5T1MwNFpURTNMVFExTXpkbU5tSXhaVGxsWkNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuMkc3bmVERE41N0pCM1dUT1FSQUdMRW93blJPU0ZVcFR3UW5uNGp1MURpZyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzY1NDMyMTE3LCJyZWZyZXNoX3Rva2VuIjoienh3NGJtaWF2cW40IiwidXNlciI6eyJpZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTA5ZDhlMzRlMSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF9jb25maXJtZWRfYXQiOiIyMDI1LTEwLTA2VDExOjQzOjAyLjUyMzY4MloiLCJwaG9uZSI6IiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTIzNjgyWiIsInJlY292ZXJ5X3NlbnRfYXQiOiIyMDI1LTEwLTI0VDA3OjEyOjUxLjE2MTIxOVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTEwLTI0VDA3OjEzOjA4LjU2MTY1OVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkZhbWlseSBUaHJlZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJGYW1pbHkgVGhyZWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiIsInN1YiI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6ImUxY2VlMzdkLWZkYmUtNDRiMC04MWI2LTlmY2RiZjcyOWNmYiIsImlkIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2In0seyJpZGVudGl0eV9pZCI6ImQyYzJhNzU1LWZmYzItNDIxZS05YWY4LTJiYTc0YWZjNTk3OCIsImlkIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI1LTEwLTA2VDExOjQzOjAyLjUxMjg5OFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0xMi0xMVQwNDo0ODozNy42MzQ2WiIsImlzX2Fub255bW91cyI6ZmFsc2V9fQ',
      domain: '.ideabrowser.com'
    },
    {
      name: 'sb-chqfunawciniepaqtdbd-auth-token.1',
      value: 'zg2IiwidXNlcl9pZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTA5ZDhlMzRlMSIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiRmFtaWx5IFRocmVlIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IkZhbWlseSBUaHJlZSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2Iiwic3ViIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2In0sInByb3ZpZGVyIjoiZ29vZ2xlIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTc3NTNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTE3ODA2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTEwLTA3VDA2OjQzOjU0Ljk4ODUwNVoiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTI4OThaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMTFUMDQ6NDg6MzcuNjM0NloiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0',
      domain: '.ideabrowser.com'
    },
    {
      name: 'ph_phc_IZXZuHEQ1OVlUpri2j4r0IBHnngcGRaPMBcGChJc9p9_posthog',
      value: '%7B%22distinct_id%22%3A%220199bd65-0dcd-753e-8027-3aa28d24c8e3%22%2C%22%24sesid%22%3A%5B1765428649499%2C%22019b0bb4-ec3f-7df0-bfd0-36ec7390311d%22%2C1765427964991%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.ideabrowser.com%2F%22%7D%7D',
      domain: '.ideabrowser.com'
    }
  ],
  HEADERS: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8,th;q=0.7',
    'cache-control': 'max-age=0',
    'priority': 'u=0, i',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
  }
};

class WebCrawler {
  constructor() {
    this.visitedUrls = new Set();
    this.pageData = new Map();
    this.browser = null;
    this.imageMap = new Map();
    this.imageCounter = 0;
    this.domainHost = new url.URL(CONFIG.START_URL).hostname;
  }

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create output directories
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.IMAGES_DIR)) {
      fs.mkdirSync(CONFIG.IMAGES_DIR, { recursive: true });
    }
    console.log('✅ Browser initialized');
  }

  isSameDomain(targetUrl) {
    try {
      const targetHost = new url.URL(targetUrl).hostname;
      return targetHost === this.domainHost;
    } catch {
      return false;
    }
  }

  isChildOfStartUrl(targetUrl) {
    try {
      // Extract base path from starting URL (everything up to and including /idea/...)
      const startUrlObj = new url.URL(CONFIG.START_URL);
      const targetUrlObj = new url.URL(targetUrl);

      // Get the path parts
      const startPath = startUrlObj.pathname;
      const targetPath = targetUrlObj.pathname;

      // Extract the main path segment (e.g., "/idea" or "/idea/budget-dashboard-...")
      const startPathParts = startPath.split('/').filter(p => p);
      const targetPathParts = targetPath.split('/').filter(p => p);

      // Both should start with at least the first path segment
      if (startPathParts.length === 0 || targetPathParts.length === 0) {
        return false;
      }

      // Check if target path starts with the main category of start URL
      return targetPathParts[0] === startPathParts[0];
    } catch {
      return false;
    }
  }

  isValidUrl(targetUrl) {
    try {
      const parsed = new url.URL(targetUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async downloadImage(imageUrl, pageTitle) {
    try {
      // Avoid re-downloading same image
      if (this.imageMap.has(imageUrl)) {
        return this.imageMap.get(imageUrl);
      }

      const imageNumber = ++this.imageCounter;
      const ext = path.extname(new url.URL(imageUrl).pathname) || '.jpg';
      const filename = `image_${imageNumber}${ext}`;
      const filepath = path.join(CONFIG.IMAGES_DIR, filename);

      await new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http;
        protocol.get(imageUrl, { timeout: 5000 }, (res) => {
          if (res.statusCode === 200) {
            res.pipe(fs.createWriteStream(filepath))
              .on('finish', resolve)
              .on('error', reject);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }).on('error', reject);
      });

      this.imageMap.set(imageUrl, { filename, filepath });
      return { filename, filepath };
    } catch (error) {
      console.warn(`⚠️  Failed to download image ${imageUrl}: ${error.message}`);
      return null;
    }
  }

  async crawlPage(pageUrl, depth = 0) {
    if (depth > CONFIG.MAX_DEPTH) {
      console.log(`⏭️  Skipping ${pageUrl} (max depth reached)`);
      return [];
    }

    if (this.visitedUrls.has(pageUrl)) {
      console.log(`⏭️  Already visited: ${pageUrl}`);
      return [];
    }

    if (!this.isSameDomain(pageUrl)) {
      console.log(`⏭️  Different domain: ${pageUrl}`);
      return [];
    }

    if (!this.isChildOfStartUrl(pageUrl)) {
      console.log(`⏭️  Different path (not related to start URL): ${pageUrl}`);
      return [];
    }

    this.visitedUrls.add(pageUrl);
    console.log(`\n📄 Crawling [Level ${depth}]: ${pageUrl}`);

    try {
      const page = await this.browser.newPage();

      // Set cookies
      await page.setCookie(...CONFIG.COOKIES);

      // Set headers
      await page.setExtraHTTPHeaders(CONFIG.HEADERS);

      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });

      // Extract page data
      const pageTitle = await page.title();
      const pageContent = await page.content();

      // Download images
      const images = await page.$$eval('img', imgs =>
        imgs.map(img => ({
          src: img.src,
          alt: img.alt || 'Image'
        }))
      );

      const downloadedImages = [];
      for (const img of images) {
        if (img.src) {
          const downloaded = await this.downloadImage(img.src, pageTitle);
          if (downloaded) {
            downloadedImages.push({ ...img, ...downloaded });
          }
        }
      }

      this.pageData.set(pageUrl, {
        title: pageTitle,
        content: pageContent,
        html: pageContent,
        url: pageUrl,
        depth: depth,
        images: downloadedImages
      });

      // Extract links
      const links = await page.$$eval('a', anchors =>
        anchors
          .map(a => ({
            href: a.href,
            text: a.textContent.trim().substring(0, 100)
          }))
          .filter(a => a.href && a.href.length > 0)
      );

      await page.close();

      // Recursively crawl linked pages
      const newLinks = [];
      for (const link of links) {
        if (this.isValidUrl(link.href) && !this.visitedUrls.has(link.href) && this.isChildOfStartUrl(link.href)) {
          newLinks.push(link.href);
        }
      }

      console.log(`✅ Found ${newLinks.length} new links on this page`);

      // Add delay before next request
      await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));

      // Crawl child pages
      const allChildLinks = [];
      for (const childUrl of newLinks) {
        const childLinks = await this.crawlPage(childUrl, depth + 1);
        allChildLinks.push(...childLinks);
      }

      return [pageUrl, ...allChildLinks];
    } catch (error) {
      console.error(`❌ Error crawling ${pageUrl}: ${error.message}`);
      return [];
    }
  }

  async exportToMarkdown() {
    console.log('\n📝 Exporting to Markdown...');

    const turndownService = new TurndownService();

    let markdown = '# Web Crawl Results\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n`;
    markdown += `Total pages crawled: ${this.pageData.size}\n\n`;
    markdown += '---\n\n';

    // Sort by depth then by URL
    const sortedPages = Array.from(this.pageData.values())
      .sort((a, b) => a.depth !== b.depth ? a.depth - b.depth : a.url.localeCompare(b.url));

    for (const pageData of sortedPages) {
      markdown += `## ${pageData.title}\n\n`;
      markdown += `**URL:** [${pageData.url}](${pageData.url})\n`;
      markdown += `**Depth:** ${pageData.depth}\n\n`;

      // Convert HTML to Markdown
      try {
        const htmlContent = pageData.html;
        const pageMarkdown = turndownService.turndown(htmlContent);
        markdown += pageMarkdown + '\n\n';
      } catch (e) {
        markdown += '*Content could not be converted*\n\n';
      }

      // Add images
      if (pageData.images && pageData.images.length > 0) {
        markdown += '### Images\n\n';
        for (const img of pageData.images) {
          const relPath = path.relative(CONFIG.OUTPUT_DIR, img.filepath);
          markdown += `![${img.alt}](./${relPath})\n`;
        }
        markdown += '\n';
      }

      markdown += '---\n\n';
    }

    const mdPath = path.join(CONFIG.OUTPUT_DIR, 'crawl_report.md');
    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ Markdown exported to: ${mdPath}`);
    return mdPath;
  }

  async exportToPdf() {
    console.log('\n📑 Exporting to PDF...');

    const pdfPath = path.join(CONFIG.OUTPUT_DIR, 'crawl_report.pdf');

    // Sort by depth then by URL
    const sortedPages = Array.from(this.pageData.values())
      .sort((a, b) => a.depth !== b.depth ? a.depth - b.depth : a.url.localeCompare(b.url));

    // Generate HTML content
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Web Crawl Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
    h1 {
      font-size: 32px;
      color: #0066cc;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ddd;
    }
    .page-entry {
      page-break-inside: avoid;
      margin-bottom: 50px;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #0066cc;
    }
    .page-title {
      font-size: 22px;
      font-weight: bold;
      color: #0066cc;
      margin: 0 0 10px 0;
      page-break-after: avoid;
    }
    .page-url {
      font-size: 12px;
      color: #666;
      word-break: break-all;
      margin: 5px 0;
    }
    .page-depth {
      font-size: 11px;
      color: #999;
      margin: 5px 0 15px 0;
    }
    .images-section {
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .images-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin: 15px 0 10px 0;
      page-break-after: avoid;
    }
    .image-item {
      margin: 15px 0;
      text-align: center;
    }
    .image-item img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 10px 0;
    }
    .image-alt {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🕷️ Web Crawl Report</h1>
    <div class="meta">
      <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
      <p><strong>Total Pages Crawled:</strong> ${this.pageData.size}</p>
      <p><strong>Total Images Downloaded:</strong> ${this.imageCounter}</p>
    </div>`;

    // Add each page
    for (const pageData of sortedPages) {
      const imageBase64s = pageData.images
        .filter(img => fs.existsSync(img.filepath));

      htmlContent += `
    <div class="page-entry">
      <h2 class="page-title">${this.escapeHtml(pageData.title)}</h2>
      <div class="page-url">📌 <strong>URL:</strong> <a href="${pageData.url}">${pageData.url}</a></div>
      <div class="page-depth">📊 <strong>Depth Level:</strong> ${pageData.depth}</div>
      ${imageBase64s.length > 0 ? `
        <div class="images-section">
          <div class="images-title">Images</div>
          ${imageBase64s.map((img) => {
            try {
              const imageBuffer = fs.readFileSync(img.filepath);
              const base64 = imageBuffer.toString('base64');
              const ext = path.extname(img.filepath).toLowerCase().slice(1);
              const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
              return `
            <div class="image-item">
              <img src="data:${mimeType};base64,${base64}" alt="${this.escapeHtml(img.alt)}" style="max-width: 500px;">
              <div class="image-alt">${this.escapeHtml(img.alt)}</div>
            </div>`;
            } catch (e) {
              return `<div class="image-item"><p>Image failed to load</p></div>`;
            }
          }).join('')}
        </div>
      ` : ''}
    </div>`;
    }

    htmlContent += `
  </div>
</body>
</html>`;

    // Use puppeteer to convert HTML to PDF directly using setContent
    const pdfPage = await this.browser.newPage();
    await pdfPage.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await pdfPage.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    await pdfPage.close();

    console.log(`✅ PDF exported to: ${pdfPath}`);
    return pdfPath;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  async run() {
    try {
      console.log('🕷️  Web Crawler Started\n');
      console.log(`Start URL: ${CONFIG.START_URL}`);
      console.log(`Max Depth: ${CONFIG.MAX_DEPTH}`);
      console.log(`Same Domain Only: ${CONFIG.SAME_DOMAIN_ONLY}\n`);

      await this.initialize();
      await this.crawlPage(CONFIG.START_URL, 0);

      console.log('\n' + '='.repeat(50));
      console.log(`\n✅ Crawling complete! Visited ${this.visitedUrls.size} pages\n`);

      // Export to both formats
      await this.exportToMarkdown();
      await this.exportToPdf();

      console.log('\n✅ All exports complete!');
      console.log(`📁 Output directory: ${path.resolve(CONFIG.OUTPUT_DIR)}`);
    } catch (error) {
      console.error('Fatal error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the crawler
const crawler = new WebCrawler();
crawler.run().catch(console.error);
