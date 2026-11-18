import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const out = process.env.SUNNY_SCREENSHOT_DIR || '/opt/cursor/artifacts';
await mkdir(out, { recursive: true });

const modes = [
  { id: 'listings', path: '/?sunny_preview=listings', testId: 'sunny-listings' },
  { id: 'stats', path: '/?sunny_preview=stats', testId: 'sunny-stats' },
  { id: 'compare', path: '/?sunny_preview=compare', testId: 'sunny-compare' },
];

const viewports = [
  { id: 'desktop', width: 1280, height: 800 },
  { id: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: viewport.id === 'mobile' ? 2 : 1,
    locale: 'es-CO',
  });
  await context.addInitScript(() => {
    localStorage.setItem('sunday-language', 'es');
    localStorage.setItem('sunday-theme', 'light');
  });
  const page = await context.newPage();
  for (const mode of modes) {
    await page.goto(`http://127.0.0.1:4173${mode.path}`, { waitUntil: 'domcontentloaded' });
    const panel = page.getByTestId('sunny-chat-panel');
    await panel.waitFor({ state: 'visible', timeout: 20_000 });
    await page.getByTestId(mode.testId).waitFor({ state: 'visible', timeout: 20_000 });
    const images = panel.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      await Promise.race([
        images.nth(i).evaluate((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        }),
        page.waitForTimeout(4000),
      ]);
    }
    if (mode.id === 'listings') {
      const next = panel.getByRole('button', { name: 'Foto siguiente' }).first();
      if ((await next.count()) > 0) await next.click();
    }
    if (mode.id === 'compare') {
      await panel.getByTestId('sunny-compare-chart').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    }
    await page.waitForTimeout(700);
    const file = `${out}/sunny-${mode.id}-${viewport.id}.png`;
    await page.screenshot({ path: file, fullPage: false });
    console.log('wrote', file);
  }
  await context.close();
}
await browser.close();
