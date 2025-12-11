# Configuration Reference

Complete guide to all configuration options in `crawler.js`.

## Main Configuration Block

```javascript
const CONFIG = {
  // Starting point for crawling
  START_URL: 'https://www.ideabrowser.com/idea/budget-dashboard-for-sports-teams-that-shows-parents-real-time-spending-394/',

  // How many levels deep to follow links (0-5)
  // 0 = just this page
  // 1 = links from starting URI
  // 2 = links from level 1
  // 3 = links from level 2
  // 4 = links from level 3 (current setting)
  MAX_DEPTH: 4,

  // Only crawl ideabrowser.com (don't follow external links)
  SAME_DOMAIN_ONLY: true,

  // Where to save crawled content
  OUTPUT_DIR: './crawler_output',

  // Subdirectory for downloaded images
  IMAGES_DIR: './crawler_output/images',

  // Timeout for loading each page (milliseconds)
  // Increase if pages load slowly
  TIMEOUT: 30000,

  // Delay between each request (milliseconds)
  // Increase to be more respectful to the server
  DELAY_BETWEEN_REQUESTS: 1000,

  // Authentication cookies (from your curl command)
  COOKIES: [
    {
      name: '_fbp',
      value: 'fb.1.1759819141092.203005946488196065',
      domain: '.ideabrowser.com'
    },
    // ... more cookies
  ],

  // HTTP headers to send with each request
  HEADERS: {
    'accept': 'text/html,application/xhtml+xml,...',
    'user-agent': 'Mozilla/5.0 (Macintosh; ...',
    // ... more headers
  }
};
```

## Detailed Options

### START_URL
**Type:** String
**Required:** Yes

The URL where crawling starts. All crawled pages will be related to this domain.

```javascript
START_URL: 'https://www.ideabrowser.com/idea/budget-dashboard-...'
```

### MAX_DEPTH
**Type:** Number (0-5)
**Default:** 3
**Recommended:** 2-3

Controls how deep the crawler follows links:

- `0` - Just the starting page
- `1` - Starting page + direct links
- `2` - 3 levels total (good for exploration)
- `3` - 4 levels total (recommended)
- `4+` - Very deep crawl (can be slow)

```javascript
// Crawl shallow
MAX_DEPTH: 1  // Faster, less data

// Crawl deep
MAX_DEPTH: 4  // Slower, more data
```

### SAME_DOMAIN_ONLY
**Type:** Boolean
**Default:** true

If true, only crawl ideabrowser.com. If false, follow any links found.

```javascript
// Stay on ideabrowser.com
SAME_DOMAIN_ONLY: true

// Follow external links too (not recommended)
SAME_DOMAIN_ONLY: false
```

### OUTPUT_DIR
**Type:** String
**Default:** `./crawler_output`

Directory where PDF, Markdown, and images are saved.

```javascript
// Default location (in current directory)
OUTPUT_DIR: './crawler_output'

// Custom location
OUTPUT_DIR: '/Users/bobacu/Documents/crawler_output'
```

### IMAGES_DIR
**Type:** String
**Default:** `./crawler_output/images`

Subdirectory for downloaded images.

```javascript
IMAGES_DIR: './crawler_output/images'
```

### TIMEOUT
**Type:** Number (milliseconds)
**Default:** 30000

How long to wait for each page to load before giving up.

```javascript
// Quick timeout (may miss slow pages)
TIMEOUT: 10000

// Default (30 seconds)
TIMEOUT: 30000

// Patient timeout (for slow connections)
TIMEOUT: 60000
```

### DELAY_BETWEEN_REQUESTS
**Type:** Number (milliseconds)
**Default:** 1000

Delay between each page request. Higher values are more respectful to the server.

```javascript
// No delay (fast but aggressive)
DELAY_BETWEEN_REQUESTS: 0

// Normal pace (1 second)
DELAY_BETWEEN_REQUESTS: 1000

// Slow and respectful (2 seconds)
DELAY_BETWEEN_REQUESTS: 2000

// Very slow (5+ seconds)
DELAY_BETWEEN_REQUESTS: 5000
```

### COOKIES
**Type:** Array of Objects
**Optional:** Can be empty

Authentication cookies. Get these from your curl command or browser DevTools.

```javascript
COOKIES: [
  {
    name: 'session_id',
    value: 'abc123...',
    domain: '.ideabrowser.com'
  },
  {
    name: 'auth_token',
    value: 'xyz789...',
    domain: '.ideabrowser.com'
  }
]

// Or no cookies (for public pages)
COOKIES: []
```

### HEADERS
**Type:** Object
**Optional:** Can be minimal

HTTP headers to send with requests. Copy from your curl command.

```javascript
HEADERS: {
  'accept': 'text/html,...',
  'user-agent': 'Mozilla/5.0 (Macintosh; ...',
  'accept-language': 'en-US,en;q=0.9',
}
```

## Configuration Examples

### Fast Crawl (5-10 minutes)
```javascript
MAX_DEPTH: 1
DELAY_BETWEEN_REQUESTS: 500
TIMEOUT: 15000
```

### Balanced Crawl (10-20 minutes)
```javascript
MAX_DEPTH: 2
DELAY_BETWEEN_REQUESTS: 1000
TIMEOUT: 30000
```

### Deep Crawl (20-40 minutes)
```javascript
MAX_DEPTH: 3
DELAY_BETWEEN_REQUESTS: 1500
TIMEOUT: 30000
```

### Respectful Crawl (slow, server-friendly)
```javascript
MAX_DEPTH: 2
DELAY_BETWEEN_REQUESTS: 3000
TIMEOUT: 45000
```

## How to Update Cookies

1. Open your browser DevTools (F12)
2. Go to **Application** → **Cookies**
3. Find ideabrowser.com
4. Copy cookie values
5. Update the COOKIES array in crawler.js:

```javascript
COOKIES: [
  {
    name: 'cookie_name',
    value: 'cookie_value_here',
    domain: '.ideabrowser.com'
  }
]
```

## Performance Tuning

### For Speed
```javascript
MAX_DEPTH: 1
DELAY_BETWEEN_REQUESTS: 500
TIMEOUT: 15000
```

### For Reliability
```javascript
MAX_DEPTH: 2
DELAY_BETWEEN_REQUESTS: 2000
TIMEOUT: 60000
```

### For Memory Efficiency
```javascript
MAX_DEPTH: 1
DELAY_BETWEEN_REQUESTS: 1000
TIMEOUT: 20000
```

## Common Issues

### Pages timing out
→ Increase `TIMEOUT` to 45000

### Crawler too slow
→ Reduce `DELAY_BETWEEN_REQUESTS` to 500

### Memory issues
→ Reduce `MAX_DEPTH` to 1

### Missing images
→ Check `IMAGES_DIR` has write permissions

### Authentication failing
→ Update `COOKIES` with fresh values

---

For more details, see README.md
