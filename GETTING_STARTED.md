# 🕷️ ideaBrowser Web Crawler - Getting Started

Welcome! Your web crawler is ready to use.

## What's Included

```
ideaBrowser/
├── crawler.js              ← Main crawler script
├── package.json            ← Dependencies
├── setup.sh                ← Setup script
├── README.md               ← Full documentation
├── QUICKSTART.md           ← Quick reference (you are here)
├── CONFIG.md               ← Configuration guide
├── GETTING_STARTED.md      ← This file
└── node_modules/           ← Installed packages
```

## ⚡ 5-Minute Setup

### 1. Install (one-time)
```bash
npm install
```

This installs Puppeteer (with Chromium) and other dependencies. Takes 2-3 minutes on first run.

### 2. Run
```bash
npm start
```

The crawler will:
- 🔍 Start from the configured URL
- 🔗 Follow links 4 levels deep:
  - Level 1: All links from starting URI
  - Level 2: All links from Level 1 pages
  - Level 3: All links from Level 2 pages
  - Level 4: All links from Level 3 pages
- 📸 Download all images
- 📄 Generate PDF & Markdown reports

### 3. Check Output
```bash
ls -la crawler_output/
```

You'll see:
- `crawl_report.pdf` - Formatted report with images
- `crawl_report.md` - Markdown version (editable)
- `images/` - Folder with downloaded images

## 📊 What Gets Extracted

✅ **Pages**
- Page title
- Page URL
- Crawl depth level
- All linked content

✅ **Images**
- Downloaded from each page
- Embedded in PDF
- Referenced in Markdown

✅ **Links**
- Automatically followed
- Filtered by domain
- Depth-limited crawling

## 🎯 Common Tasks

### Want to change the starting URL?
Edit `crawler.js` line 11:
```javascript
START_URL: 'https://www.ideabrowser.com/your-new-url/'
```

### Want to crawl deeper?
Edit line 12:
```javascript
MAX_DEPTH: 5  // Changed from 4
```

### Want faster crawling?
Edit line 22:
```javascript
DELAY_BETWEEN_REQUESTS: 500  // Changed from 1000
```

### Want the crawler to be slower/more respectful?
Edit line 22:
```javascript
DELAY_BETWEEN_REQUESTS: 2000  // Changed from 1000
```

## 📈 Expected Output

**For a 4-level deep crawl:**
- ⏱️ Runtime: 2-10 minutes
- 📄 PDF: 5-50 MB
- 📝 Markdown: 1-10 MB
- 🖼️ Images: 50-200 MB
- 📊 Pages: 10-100 pages

## 🚀 Next Steps

1. **Run the crawler**: `npm start`
2. **View results**: Open `crawler_output/crawl_report.pdf`
3. **Customize** (optional): See `CONFIG.md` for all options
4. **Learn more**: Read `README.md` for advanced features

## ❓ Quick Help

**Q: Where's my output?**
A: In the `crawler_output/` folder

**Q: Can I edit the crawl report?**
A: Yes! Edit `crawler_output/crawl_report.md` with any text editor

**Q: How do I add more pages?**
A: Change `START_URL` and run again

**Q: Is it using my authentication?**
A: Yes, cookies are already configured from your curl command

**Q: Can I crawl other domains?**
A: Yes, change `SAME_DOMAIN_ONLY: false` in crawler.js (line 15)

## 📚 Documentation

- **QUICKSTART.md** - Fast reference guide
- **CONFIG.md** - All configuration options explained
- **README.md** - Full documentation with examples
- **This file** - Getting started guide

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm command not found" | Install Node.js from nodejs.org |
| Slow crawling | Reduce MAX_DEPTH or DELAY_BETWEEN_REQUESTS |
| Out of memory | Set MAX_DEPTH to 1 |
| Missing images | Check crawler_output/images/ folder |
| Timeout errors | Increase TIMEOUT in CONFIG |

## 💡 Pro Tips

1. **Start shallow**: Test with MAX_DEPTH: 1 first
2. **Check your output**: Open PDF to verify it worked
3. **Adjust as needed**: Tweak settings based on results
4. **Save results**: Back up crawler_output/ if important

## 🎓 Learn More

- See `CONFIG.md` for all available options
- See `README.md` for advanced usage
- See `QUICKSTART.md` for common scenarios

---

**You're ready! Run `npm start` to begin crawling 🕷️**

Questions? Check the documentation files above or see README.md for troubleshooting.
