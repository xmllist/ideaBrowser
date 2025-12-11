# Quick Start Guide

Get the crawler running in 3 steps!

## 1️⃣ Install Dependencies

```bash
npm install
```

**First time only** - this downloads Chromium (~300MB), takes 2-3 minutes.

## 2️⃣ Run the Crawler

```bash
npm start
```

or

```bash
node crawler.js
```

That's it! The crawler will:
- ✅ Start crawling from the configured URL
- ✅ Follow links 4 levels deep:
  - Level 1: All links from starting URI
  - Level 2: All links from Level 1 pages
  - Level 3: All links from Level 2 pages
  - Level 4: All links from Level 3 pages
- ✅ Download all images
- ✅ Generate PDF and Markdown reports
- ✅ Save everything to `crawler_output/`

## 📊 What You'll Get

```
crawler_output/
├── crawl_report.pdf       ← Beautiful PDF with all pages & images
├── crawl_report.md        ← Markdown file for editing
└── images/
    ├── image_1.jpg
    ├── image_2.png
    └── ...
```

## ⚙️ Customize (Optional)

Edit `crawler.js` line 10-20 to change:

```javascript
const CONFIG = {
  START_URL: 'https://...',  // Change starting page
  MAX_DEPTH: 3,              // Change crawl depth (1-5)
  DELAY_BETWEEN_REQUESTS: 1000, // Slow down crawling (ms)
};
```

## 🚀 Common Scenarios

### Crawl just one page
```javascript
MAX_DEPTH: 0
```

### Crawl faster (uses more CPU)
```javascript
DELAY_BETWEEN_REQUESTS: 500
```

### Crawl slower (more respectful)
```javascript
DELAY_BETWEEN_REQUESTS: 2000
```

### Crawl deeper
```javascript
MAX_DEPTH: 5
```

## 📈 Performance

- **First crawl**: 30 seconds - 2 minutes (includes Chromium download)
- **Subsequent crawls**: 30 seconds - 2 minutes
- **Output size**: 50MB - 200MB (depending on pages & images)

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Too slow | Reduce MAX_DEPTH to 2 |
| Out of memory | Reduce MAX_DEPTH to 1 |
| Missing images | Check `crawler_output/images/` folder |
| Authentication failing | Verify cookies are current |
| Timeout errors | Increase TIMEOUT value in CONFIG |

## 📚 Learn More

See `README.md` for detailed documentation.

---

**Happy crawling! 🕷️**
