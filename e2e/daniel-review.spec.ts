import { expect, test, type Page } from '@playwright/test';
import path from 'path';

const LISTINGS = [
  'brisas-del-estadio',
  'el-escorial-701',
  'casa-lauret',
  'apartamento-campo-nuevo',
];

const STREET_LEAK = /Carrera\s*74|Apto\s*517|No\.\s*53-162/i;

async function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/Failed to load resource|net::ERR|favicon|Download the React DevTools/i.test(text)) {
        return;
      }
      errors.push(text);
    }
  });
  return errors;
}

async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((value) => {
    window.localStorage.setItem('sunday-theme', value);
    window.localStorage.setItem('sunday-language', 'es');
  }, theme);
}

async function gotoReady(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).not.toBeEmpty();
}

test.describe('Daniel iPhone review', () => {
  test('home, properties, listings, auth and maps', async ({ page }, testInfo) => {
    const errors = await collectPageErrors(page);
    await setTheme(page, 'light');
    await gotoReady(page, '/');

    await expect(page.getByRole('link', { name: /Arrendamientos|Rentals/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Compraventas|Sales/i }).first()).toBeVisible();
    await expect(page.getByText(/10,000/)).toHaveCount(0);
    await expect(page.getByText(/1\.5%/)).toHaveCount(0);

    const langToggle = page.getByTestId('language-switcher');
    await expect(langToggle).toBeVisible();
    await expect(langToggle).toHaveText(/^(EN|ES)$/);
    const before = (await langToggle.innerText()).trim();
    await langToggle.click();
    await expect(langToggle).toHaveText(before === 'EN' ? 'ES' : 'EN');

    const city = page.getByPlaceholder(/Ciudad|City/i).first();
    await city.fill('Medellín');
    await page.getByRole('link', { name: /Arrendamientos|Rentals/i }).first().click();
    await expect(page).toHaveURL(/listing_type=rental/);
    await expect(page).toHaveURL(/city=/);

    await gotoReady(page, '/properties');
    await expect(page.locator('body')).toContainText(/Explor|Propert/i);
    await expect(page.locator('body')).not.toContainText(STREET_LEAK);

    for (const slug of LISTINGS) {
      await gotoReady(page, `/properties/${slug}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(STREET_LEAK);
      await expect(page.getByRole('link', { name: /Abrir en Google Maps|Open in Google Maps/i })).toBeVisible();
      await expect(
        page.locator('[data-testid="neighborhood-map"], [data-testid="neighborhood-map-fallback"]')
      ).toBeVisible({ timeout: 20_000 });
      const googleScripts = await page.locator('script[src*="maps.googleapis.com"]').count();
      expect(googleScripts).toBe(0);
    }

    await gotoReady(page, '/login');
    const loginEmail = page.getByLabel(/correo|email/i).first();
    await expect(loginEmail).toBeVisible();
    await loginEmail.fill('nobody@example.com');
    await page.locator('#password').fill('wrong-password');
    await page.getByRole('button', { name: /Sign In|Iniciar|Entrar/i }).click();
    await expect(page.locator('[role="alert"], .text-destructive, p')).toContainText(/.+/, {
      timeout: 10_000,
    });
    await expect(page.getByRole('link', { name: /Olvidaste|Forgot/i })).toBeVisible();

    await gotoReady(page, '/signup');
    await expect(page.getByLabel(/nombre|name/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Create|Crear|Regist/i }).click();
    await expect(page.locator('body')).toContainText(/.+/);

    await gotoReady(page, '/forgot-password');
    await page.getByLabel(/correo|email/i).first().fill('ui-test-not-a-real-user@example.invalid');
    await page.route('**/auth/v1/recover**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });
    await page.getByRole('button', { name: /Send|Enviar/i }).click();
    await expect(page.locator('body')).toContainText(/link|enlace|envi/i);

    await gotoReady(page, '/reset-password');
    await expect(page.getByLabel(/Nueva|New password|Contraseña/i).first()).toBeVisible();
    await page.locator('#password').fill('short');
    await page.locator('#confirm').fill('short');
    await page.getByRole('button', { name: /Update|Actualizar/i }).click();
    await expect(page.locator('body')).toContainText(/8|letra|letter|número|number/i);

    const shotDir = path.join(testInfo.outputDir, 'shots');
    await gotoReady(page, '/');
    await page.screenshot({
      path: path.join(shotDir, `home-light-${testInfo.project.name}.png`),
      fullPage: true,
    });
    await gotoReady(page, '/properties/brisas-del-estadio');
    await page.screenshot({
      path: path.join(shotDir, `listing-light-${testInfo.project.name}.png`),
      fullPage: true,
    });

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('dark mode home and listing', async ({ page }, testInfo) => {
    const errors = await collectPageErrors(page);
    await setTheme(page, 'dark');
    await gotoReady(page, '/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({
      path: path.join(testInfo.outputDir, `home-dark-${testInfo.project.name}.png`),
      fullPage: true,
    });
    await gotoReady(page, '/properties/brisas-del-estadio');
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({
      path: path.join(testInfo.outputDir, `listing-dark-${testInfo.project.name}.png`),
      fullPage: true,
    });
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
