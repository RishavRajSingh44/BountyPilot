import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { uiSearch } from '../fixtures/ui';
test.beforeEach(async ({ request }) => {
  await request.post('http://127.0.0.1:3101/test-state', { data: { mode: 'ready' } });
});
test('synthetic full journey uses real analysis validation, SQLite persistence and confirmed removal', async ({
  page
}) => {
  await page.route('**/api/opportunities?*', (route) => route.fulfill({ json: uiSearch }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Search GitHub', exact: true }).click();
  await page.getByRole('link', { name: 'Synthetic fixture: fix CSV parser escaping' }).click();
  await expect(page.getByRole('heading', { name: 'Evidence and uncertainty' })).toBeVisible();
  await page.getByRole('button', { name: 'Analyze opportunity', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel analysis' })).toBeVisible();
  await expect(page.getByText('Analysis complete and saved locally.')).toBeVisible();
  await expect(page.getByText('“funding is unconfirmed”', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save opportunity', exact: true }).click();
  await expect(page.getByText('Saved to your local pipeline.')).toBeVisible();
  await page.getByRole('link', { name: 'Pipeline', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Status for Synthetic fixture: fix CSV parser escaping' })
    .selectOption('evaluating');
  await expect(page.getByText('Pipeline status updated to evaluating.')).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Status for Synthetic fixture: fix CSV parser escaping' })
  ).toHaveValue('evaluating');
  await page.getByRole('link', { name: 'Synthetic fixture: fix CSV parser escaping' }).click();
  await expect(
    page.getByText('Synthetic analysis: fix quoted CSV parsing and add tests.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove from pipeline', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep saved' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Remove from pipeline', exact: true })
  ).toBeFocused();
});
test('responsive themes, keyboard navigation and screenshot QA', async ({ page }) => {
  const directory = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache', 'visual');
  mkdirSync(directory, { recursive: true });
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 834, 1112],
    ['mobile', 390, 844]
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.getByRole('button', { name: 'Toggle color theme' }).click();
      for (const [route, label] of [
        ['/overview', 'overview'],
        ['/', 'discover'],
        ['/pipeline', 'pipeline'],
        ['/settings', 'settings'],
        ['/opportunities/synthetic-owner/fixture/7', 'detail']
      ]) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator('h1')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        ).toBe(true);
        await page.screenshot({
          path: resolve(directory, `${label}-${name}-${theme}.png`),
          fullPage: true
        });
      }
    }
  }
});
