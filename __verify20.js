const { chromium } = require('playwright-core');
const path = require('path');
const root = __dirname;
const exePath = "C:/Users/jesse/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
(async () => {
  const browser = await chromium.launch({ executablePath: exePath });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.on('pageerror', (e) => errors.push('pageerror:' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console:' + m.text()); });

  // hero panel
  await page.goto('file:///' + root + '/index.html');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(root, 'shot_hero_fixed.png') });

  // navigate to regen project panel
  await page.click('[data-door]');
  await page.waitForTimeout(1200);
  await page.click('[data-monitor]');
  await page.waitForTimeout(400);
  await page.click('[data-open-panel="regen"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(root, 'shot_regen_fixed.png') });

  const gridCheck = await page.evaluate(() => {
    const pb = document.querySelector('#panel-regen .panel-body');
    const cs = getComputedStyle(pb);
    return { display: cs.display, flexDirection: cs.flexDirection };
  });
  console.log('panel-regen .panel-body computed:', JSON.stringify(gridCheck));

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
