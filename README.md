# ideaBrowser Web Crawler

A comprehensive web crawler for ideabrowser.com that extracts content, images, and exports to both PDF and Markdown formats.

## Features

✅ **Recursive crawling** - Follow links 4 levels deep
✅ **Same-domain protection** - Only crawl ideabrowser.com
✅ **Image extraction** - Download and embed all images
✅ **Dual export** - Generate both PDF and Markdown reports
✅ **Authentication support** - Built-in cookie & header handling
✅ **Rate limiting** - Respectful delays between requests

## Prerequisites

- Node.js 16+ (install from https://nodejs.org/)
- macOS/Linux/Windows with Chromium support

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **puppeteer** - Headless browser automation
- **pdfkit** - PDF generation
- **turndown** - HTML to Markdown conversion

> **Note:** Puppeteer automatically downloads Chromium on first run (~300MB)

### 2. Configuration (Optional)

The crawler comes pre-configured with:
- Your authentication cookies from the curl command
- Proper headers for ideabrowser.com
- 3-level deep crawl
- Same-domain filtering

To customize, edit `crawler.js` - CONFIG section:

```javascript
const CONFIG = {
  START_URL: 'https://www.ideabrowser.com/idea/...',  // Starting page
  MAX_DEPTH: 3,                                         // How deep to crawl
  SAME_DOMAIN_ONLY: true,                             // Stay on ideabrowser.com
  OUTPUT_DIR: './crawler_output',                     // Output directory
  TIMEOUT: 30000,                                      // Page timeout (ms)
  DELAY_BETWEEN_REQUESTS: 1000                        // Delay between requests (ms)
};
```

## Usage

### Run the crawler:

```bash
npm start
```

or

```bash
node crawler.js
```

### Output

The crawler generates:

```
crawler_output/
├── crawl_report.pdf          # Complete PDF report with images
├── crawl_report.md           # Markdown report with image links
└── images/                   # Downloaded images
    ├── image_1.jpg
    ├── image_2.png
    └── ...
```

## What Gets Crawled

1. **Page Content**
   - HTML content (converted to Markdown)
   - Page titles and URLs
   - Crawl depth level

2. **Images**
   - All `<img>` tags
   - Automatic deduplication (same image not downloaded twice)
   - Embedded in both PDF and Markdown

3. **Links**
   - All `<a>` tags extracted
   - Automatically followed (respecting depth limit)
   - Invalid URLs filtered out

## Example Output

### PDF Report
- Each page on a separate sheet
- Images embedded at their actual size
- Professional formatting
- Easy to print or share

### Markdown Report
- Clean, readable format
- Images as relative links
- Easy to edit or convert further
- Preserves page structure

## Performance Notes

- **First run**: ~2-3 minutes (includes Chromium download)
- **Subsequent runs**: ~30 seconds - 2 minutes (depending on page count)
- **Output size**:
  - PDF: 5-50MB (depending on images)
  - Markdown: 1-10MB
  - Images: 50-200MB

## Troubleshooting

### "Puppeteer download failed"
```bash
# Install Chromium separately
npm install --save-optional puppeteer
```

### "Too many open files"
- Reduce `MAX_DEPTH` to 2
- Increase `DELAY_BETWEEN_REQUESTS` to 2000ms

### "Images not loading in PDF"
- Check `crawler_output/images/` directory
- Ensure disk space is available
- Some images may be blocked (expected behavior)

### "Authentication failing"
- Verify cookies in CONFIG are current
- Cookies may expire - update from fresh curl command
- Add more cookies if needed from your browser DevTools

## Advanced Configuration

### Extract more data
Edit the `crawlPage` method to extract:
```javascript
// Add any CSS selectors you want
const metadata = await page.$$eval('meta', metas =>
  metas.map(m => ({ name: m.name, content: m.content }))
);
```

### Custom PDF formatting
Edit the `exportToPdf` function's `docDefinition` object to change:
- Fonts and sizes
- Colors and styles
- Page layout
- Image sizes

### Custom Markdown formatting
Edit the `exportToMarkdown` function to:
- Change heading levels
- Add custom metadata
- Reorder content
- Add table of contents

## API Reference

### WebCrawler Class

```javascript
const crawler = new WebCrawler();

// Initialize browser
await crawler.initialize();

// Crawl a page recursively
const links = await crawler.crawlPage(url, depth);

// Export to Markdown
await crawler.exportToMarkdown();

// Export to PDF
await crawler.exportToPdf();
```

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Crawler too slow | Reduce MAX_DEPTH, increase DELAY |
| Memory issues | Reduce MAX_DEPTH to 2 |
| Missing images | Check file permissions, disk space |
| Incomplete pages | Increase TIMEOUT value |
| Authentication errors | Refresh cookies in CONFIG |

## Performance Tips

1. **Reduce depth**: Change `MAX_DEPTH` to 2 for faster crawling
2. **Skip images**: Comment out image download code for speed
3. **Parallel crawling**: Modify to use page pool (advanced)
4. **Incremental crawling**: Save progress to resume later

## License

MIT

## Support

For issues or questions, check:
1. The Troubleshooting section above
2. Puppeteer documentation: https://pptr.dev/
3. PDFKit documentation: http://pdfkit.org/

---

**Happy crawling! 🕷️**
