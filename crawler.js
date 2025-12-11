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
      name: 'ph_phc_IZXZuHEQ1OVlUpri2j4r0IBHnngcGRaPMBcGChJc9p9_posthog',
      value: '%7B%22distinct_id%22%3A%220199bd65-0dcd-753e-8027-3aa28d24c8e3%22%2C%22%24sesid%22%3A%5B1765425993520%2C%22019b0b87-9a3c-7ddb-9e36-ecfa297a7eba%22%2C1765424994876%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.ideabrowser.com%2F%22%7D%7D',
      domain: '.ideabrowser.com'
    }
  ],
  HEADERS: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
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
        if (this.isValidUrl(link.href) && !this.visitedUrls.has(link.href)) {
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
      const imageAbsPaths = pageData.images
        .filter(img => fs.existsSync(img.filepath))
        .map(img => `file://${path.resolve(img.filepath)}`);

      htmlContent += `
    <div class="page-entry">
      <h2 class="page-title">${this.escapeHtml(pageData.title)}</h2>
      <div class="page-url">📌 <strong>URL:</strong> <a href="${pageData.url}">${pageData.url}</a></div>
      <div class="page-depth">📊 <strong>Depth Level:</strong> ${pageData.depth}</div>
      ${imageAbsPaths.length > 0 ? `
        <div class="images-section">
          <div class="images-title">Images</div>
          ${imageAbsPaths.map((imgPath, idx) => `
            <div class="image-item">
              <img src="${imgPath}" alt="${this.escapeHtml(pageData.images[idx].alt)}">
              <div class="image-alt">${this.escapeHtml(pageData.images[idx].alt)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>`;
    }

    htmlContent += `
  </div>
</body>
</html>`;

    // Create temporary HTML file
    const tempHtmlPath = path.join(CONFIG.OUTPUT_DIR, 'temp_report.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Use puppeteer to convert HTML to PDF
    const tempPage = await this.browser.newPage();
    await tempPage.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle2' });
    await tempPage.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    await tempPage.close();

    // Clean up temporary HTML file
    fs.unlinkSync(tempHtmlPath);

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
