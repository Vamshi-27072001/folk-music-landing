const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, 'out', 'rawvideo');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: outDir, size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  await page.goto('file:///' + path.join(__dirname, 'mockup.html').replace(/\\/g, '/'));

  const RUN_MS = 34000; // timeline ends ~33s, small buffer
  await page.waitForTimeout(RUN_MS);

  await page.close();
  const videoPath = await page.video().path().catch(() => null);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webm'));
  console.log('Recorded:', files);
})();
