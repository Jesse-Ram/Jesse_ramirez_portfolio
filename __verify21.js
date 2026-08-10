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
  await page.goto('file:///' + root + '/index.html');
  await page.waitForTimeout(300);
  await page.click('[data-door]');
  await page.waitForTimeout(1200);
  await page.click('[data-monitor]');
  await page.waitForTimeout(400);

  for (const id of ['regen', 'pintle-injector', 'firelab', 'spider-seeder']) {
    await page.click(`[data-open-panel="${id}"]`);
    await page.waitForTimeout(300);
    await page.evaluate((id) => document.querySelector(`#panel-${id} .overlay-panel-inner`).scrollTo(0, 999999), id);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(root, `shotD_${id}.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
