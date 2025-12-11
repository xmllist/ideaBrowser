const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Configuration - reuse cookies from crawler
const CONFIG = {
  OUTPUT_DIR: './crawler_output',
  SCREENSHOTS_DIR: './crawler_output/screenshots',
  TIMEOUT: 60000,
  DELAY_BETWEEN_REQUESTS: 2000,
  COOKIES: [
    {
      name: '_fbp',
      value: 'fb.1.1759819141092.203005946488196065',
      domain: '.ideabrowser.com'
    },
    {
      name: '__stripe_mid',
      value: '3cfd962c-81eb-42e8-9caf-ac6df33ca8fd18fa49',
      domain: '.www.ideabrowser.com'
    },
    {
      name: 'sb-chqfunawciniepaqtdbd-auth-token.0',
      value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SW5aMlVGTmtOMmQwUmxWU1dIVkVSa1VpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJOb2NXWjFibUYzWTJsdWFXVndZWEYwWkdKa0xuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSmtPRFUyTjJJNVl5MWxOMkUzTFRRNFkyWXRZV05oWXkwMk9HVXhPV1E0WlRNMFpURWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZMU5ETXlNVEUzTENKcFlYUWlPakUzTmpVME1qZzFNVGNzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0p3YUc5dVpTSTZJaUlzSW1Gd2NGOXRaWFJoWkdGMFlTSTZleUp3Y205MmFXUmxjaUk2SW1kdmIyZHNaU0lzSW5CeWIzWnBaR1Z5Y3lJNld5Sm5iMjluYkdVaVhYMHNJblZ6WlhKZmJXVjBZV1JoZEdFaU9uc2lZWFpoZEdGeVgzVnliQ0k2SW1oMGRIQnpPaTh2YkdnekxtZHZiMmRzWlhWelpYSmpiMjUwWlc1MExtTnZiUzloTDBGRFp6aHZZMHR2TUhwUk1sVXlURFpVZW5BMU0weHZOSGRDZG5ORE1uZDRjVzFXVFZsUVoybzJSM1J3TmxWd1ptbE1ObmsxUVQxek9UWXRZeUlzSW1WdFlXbHNJam9pYzNCeUxtWnlhV1Z1WkhNd00wQm5iV0ZwYkM1amIyMGlMQ0psYldGcGJGOTJaWEpwWm1sbFpDSTZkSEoxWlN3aVpuVnNiRjl1WVcxbElqb2lSbUZ0YVd4NUlGUm9jbVZsSWl3aWFYTnpJam9pYUhSMGNITTZMeTloWTJOdmRXNTBjeTVuYjI5bmJHVXVZMjl0SWl3aWJtRnRaU0k2SWtaaGJXbHNlU0JVYUhKbFpTSXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWNHbGpkSFZ5WlNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB0dk1IcFJNbFV5VERaVWVuQTFNMHh2TkhkQ2RuTkRNbmQ0Y1cxV1RWbFFaMm8yUjNSd05sVndabWxNTm5rMVFUMXpPVFl0WXlJc0luQnliM1pwWkdWeVgybGtJam9pTVRBNU56WTNNekV5TURFM016UXhNRGN4TXpnMklpd2ljM1ZpSWpvaU1UQTVOelkzTXpFeU1ERTNNelF4TURjeE16ZzJJbjBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pYjJGMWRHZ2lMQ0owYVcxbGMzUmhiWEFpT2pFM05UazRNVGswTXpWOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpJd05XVTJPVGczTFRZd05tUXRORFF5T1MwNFpURTNMVFExTXpkbU5tSXhaVGxsWkNJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkuMkc3bmVERE41N0pCM1dUT1FSQUdMRW93blJPU0ZVcFR3UW5uNGp1MURpZyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzY1NDMyMTE3LCJyZWZyZXNoX3Rva2VuIjoienh3NGJtaWF2cW40IiwidXNlciI6eyJpZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF9jb25maXJtZWRfYXQiOiIyMDI1LTEwLTA2VDExOjQzOjAyLjUyMzY4MloiLCJwaG9uZSI6IiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTIzNjgyWiIsInJlY292ZXJ5X3NlbnRfYXQiOiIyMDI1LTEwLTI0VDA3OjEyOjUxLjE2MTIxOVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI1LTEwLTI0VDA3OjEzOjA4LjU2MTY1OVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkZhbWlseSBUaHJlZSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJGYW1pbHkgVGhyZWUiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbzB6UTJVMkw2VHpwNTNMbzR3QnZzQzJ3eHFtVk1ZUGdqNkd0cDZVcGZpTDZ5NUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiIsInN1YiI6IjEwOTc2NzMxMjAxNzM0MTA3MTM4NiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6ImUxY2VlMzdkLWZkYmUtNDRiMC04MWI2LTlmY2RiZjcyOWNmYiIsImlkIjoiMTA5NzY3MzEyMDE3MzQxMDcxM',
      domain: 'www.ideabrowser.com'
    },
    {
      name: 'sb-chqfunawciniepaqtdbd-auth-token.1',
      value: 'zg2IiwidXNlcl9pZCI6ImQ4NTY3YjljLWU3YTctNDhjZi1hY2FjLTY4ZTE5ZDhlMzRlMSIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsImVtYWlsIjoic3ByLmZyaWVuZHMwM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiRmFtaWx5IFRocmVlIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IkZhbWlseSBUaHJlZSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tvMHpRMlUyTDZUenA1M0xvNHdCdnNDMnd4cW1WTVlQZ2o2R3RwNlVwZmlMNnk1QT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2Iiwic3ViIjoiMTA5NzY3MzEyMDE3MzQxMDcxMzg2In0sInByb3ZpZGVyIjoiZ29vZ2xlIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTc3NTNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTAtMDZUMTE6NDM6MDIuNTE3ODA2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTEwLTA3VDA2OjQzOjU0Ljk4ODUwNVoiLCJlbWFpbCI6InNwci5mcmllbmRzMDNAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNS0xMC0wNlQxMTo0MzowMi41MTI4OThaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMTFUMDQ6NDg6MzcuNjM0NloiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0',
      domain: 'www.ideabrowser.com'
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

// Extract URLs from crawl_report.md
function extractUrls() {
  const reportPath = path.join(CONFIG.OUTPUT_DIR, 'crawl_report.md');
  const content = fs.readFileSync(reportPath, 'utf-8');

  // Match URLs in the format **URL:** [url](url)
  const urlRegex = /\*\*URL:\*\* \[(https?:\/\/[^\]]+)\]/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  // Remove duplicates while preserving order
  return [...new Set(urls)];
}

async function takeScreenshots(urls) {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Create screenshots directory
  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

  const screenshotPaths = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Screenshotting: ${url}`);

    try {
      const page = await browser.newPage();

      // Set viewport for consistent screenshots
      await page.setViewport({ width: 1440, height: 900 });

      // Set cookies
      await page.setCookie(...CONFIG.COOKIES);

      // Set headers
      await page.setExtraHTTPHeaders(CONFIG.HEADERS);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });

      // Wait for content to render
      await page.waitForSelector('body', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Take full page screenshot
      const screenshotPath = path.join(CONFIG.SCREENSHOTS_DIR, `page_${String(i + 1).padStart(3, '0')}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      screenshotPaths.push(screenshotPath);
      console.log(`   Saved: ${screenshotPath}`);

      await page.close();

      // Delay between requests
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));
      }
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }

  await browser.close();
  return screenshotPaths;
}

async function mergeToPdf(screenshotPaths) {
  console.log('\nMerging screenshots into PDF...');

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < screenshotPaths.length; i++) {
    const screenshotPath = screenshotPaths[i];
    console.log(`[${i + 1}/${screenshotPaths.length}] Adding: ${path.basename(screenshotPath)}`);

    try {
      const imageBytes = fs.readFileSync(screenshotPath);
      const image = await pdfDoc.embedPng(imageBytes);

      // Get image dimensions
      const { width, height } = image.scale(1);

      // Create page with image dimensions (or scale to fit A4 width)
      const maxWidth = 595; // A4 width in points
      const scale = maxWidth / width;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      const page = pdfDoc.addPage([scaledWidth, scaledHeight]);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: scaledWidth,
        height: scaledHeight,
      });
    } catch (error) {
      console.error(`   Error adding ${screenshotPath}: ${error.message}`);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(CONFIG.OUTPUT_DIR, 'screenshots_merged.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`\nPDF saved to: ${outputPath}`);
  return outputPath;
}

async function main() {
  console.log('Screenshot to PDF Tool\n');
  console.log('='.repeat(50));

  // Extract URLs
  console.log('\nExtracting URLs from crawl_report.md...');
  const urls = extractUrls();
  console.log(`Found ${urls.length} unique URLs\n`);

  // Take screenshots
  const screenshotPaths = await takeScreenshots(urls);
  console.log(`\nCaptured ${screenshotPaths.length} screenshots`);

  // Merge to PDF
  if (screenshotPaths.length > 0) {
    await mergeToPdf(screenshotPaths);
  }

  console.log('\nDone!');
}

main().catch(console.error);
