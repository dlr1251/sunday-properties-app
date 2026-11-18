import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin = process.env.MCP_PREVIEW_ORIGIN || 'http://127.0.0.1:8787';
const out = process.env.CHATGPT_SCREENSHOT_DIR || '/opt/cursor/artifacts';
await mkdir(out, { recursive: true });

const kinds = [
  { id: 'listings', testId: 'sunday-listings' },
  { id: 'stats', testId: 'sunny-stats' },
  { id: 'compare', testId: 'sunny-compare' },
];
const themes = ['light', 'dark'];
const viewports = [
  { id: 'desktop', width: 1100, height: 860 },
  { id: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const viewport of viewports) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: viewport.id === 'mobile' ? 2 : 1,
      locale: 'es-CO',
      colorScheme: theme,
    });
    const page = await context.newPage();
    for (const kind of kinds) {
      await page.goto(`${origin}/api/mcp/preview?kind=${kind.id}&theme=${theme}`, {
        waitUntil: 'domcontentloaded',
      });
      const frame = page.frameLocator('[data-testid="sunday-mcp-widget"]');
      await frame.getByTestId(kind.testId).waitFor({ state: 'visible', timeout: 20_000 });
      const images = frame.locator('img');
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
      if (kind.id === 'listings') {
        const next = frame.getByRole('button', { name: 'Foto siguiente' }).first();
        if ((await next.count()) > 0) await next.click();
      }
      await page.waitForTimeout(500);
      const file = `${out}/chatgpt-${kind.id}-${theme}-${viewport.id}.png`;
      await page.screenshot({ path: file, fullPage: false });
      console.log('wrote', file);
    }
    await context.close();
  }
}
await browser.close();
