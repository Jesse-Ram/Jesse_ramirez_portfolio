const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\jesse\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });
  const target = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  await page.goto(target);
  await page.waitForTimeout(300);
  console.log('1. start stage:', await page.evaluate(() => document.body.getAttribute('data-stage')));

  await page.click('[data-door]');
  await page.waitForTimeout(400);
  console.log('2. after door click:', await page.evaluate(() => document.body.getAttribute('data-stage')));

  await page.click('[data-monitor]');
  await page.waitForTimeout(400);
  console.log('3. after monitor click:', await page.evaluate(() => document.body.getAttribute('data-stage')));

  const slugs = ['regen', 'engine-tool', 'ground-systems', 'pintle-injector', 'firelab', 'tiles', 'lspace', 'spider-seeder'];
  for (const slug of slugs) {
    await page.click(`[data-open-panel="${slug}"]`);
    await page.waitForTimeout(250);
    const panelState = await page.evaluate(() => document.body.getAttribute('data-panel'));
    const isolated = await page.evaluate((s) => {
      // confirm no other panel is open/visible at the same time
      const openPanels = document.querySelectorAll('.overlay-panel.is-open');
      return openPanels.length === 1 && openPanels[0].id === 'panel-' + s;
    }, slug);
    console.log(`4. project ${slug}: data-panel=${panelState} isolated=${isolated}`);
    await page.click('.overlay-panel.is-open [data-close-panel]');
    await page.waitForTimeout(250);
  }

  await page.click('[data-db-view="modules"]');
  await page.waitForTimeout(200);
  const moduleKeys = ['module:personnel', 'module:capabilities', 'module:experience', 'module:reference'];
  for (const key of moduleKeys) {
    await page.click(`[data-open-panel="${key}"]`);
    await page.waitForTimeout(250);
    const panelState = await page.evaluate(() => document.body.getAttribute('data-panel'));
    console.log(`5. module ${key}: data-panel=${panelState}`);
    await page.click('[data-close-panel]');
    await page.waitForTimeout(250);
  }

  await page.click('[data-back]');
  await page.waitForTimeout(300);
  console.log('6. after back-to-habitat:', await page.evaluate(() => document.body.getAttribute('data-stage')));

  await page.click('[data-exit]');
  await page.waitForTimeout(300);
  console.log('7. after exit habitat:', await page.evaluate(() => document.body.getAttribute('data-stage')));

  // résumé/contact reachability
  const resumeHref = await page.evaluate(() => document.querySelector('.stage-hud a[download]')?.getAttribute('href'));
  const contactHref = await page.evaluate(() => document.querySelector('.stage-hud a[href*="contact"]')?.getAttribute('href'));
  console.log('8. resume href:', resumeHref, '| contact href:', contactHref);

  console.log('ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
