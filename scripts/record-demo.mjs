import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const base = new URL(process.env.APP_ORIGIN || 'http://127.0.0.1:3000');
assert(
  base.protocol === 'http:' &&
    base.hostname === '127.0.0.1' &&
    base.pathname === '/' &&
    !base.search &&
    !base.hash,
  'Use the configured local app origin'
);
const repo = process.argv[2];
assert(
  /^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repo || ''),
  'Supply a real public owner/repository to search'
);
const directory = resolve(process.env.BOUNTYPILOT_CACHE_DIR || '.cache', 'demo');
mkdirSync(directory, { recursive: true });
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve(
  process.env.BOUNTYPILOT_CACHE_DIR || '.cache',
  'browsers'
);
const { chromium, expect } = await import('@playwright/test');
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: directory, size: { width: 1440, height: 1000 } }
});
const page = await context.newPage();
const video = page.video();
const started = new Date().toISOString();
try {
  await page.goto(base.origin);
  await page.getByLabel('Repository (optional)', { exact: true }).fill(repo);
  await page.getByLabel('Skills for local scoring', { exact: true }).fill('typescript, testing');
  await page.getByRole('button', { name: 'Search GitHub', exact: true }).click();
  await expect(page.locator('.opportunity-row').first()).toBeVisible({ timeout: 30000 });
  await page.screenshot({ path: resolve(directory, 'real-discovery.png'), fullPage: true });
  let selected;
  for (const row of await page.locator('.opportunity-row').all()) {
    if (await row.getByRole('button', { name: /^Save / }).count()) {
      selected = row.getByRole('heading').getByRole('link');
      break;
    }
  }
  assert(
    selected,
    'No unsaved result on this page. Use another real repository; existing data will not be removed.'
  );
  const title = await selected.innerText();
  await selected.click();
  await expect(page.getByRole('link', { name: 'Back to Discover', exact: true })).toBeVisible();
  const load = page.getByRole('button', { name: 'Load issue from GitHub', exact: true });
  if (await load.count()) await load.click();
  await expect(
    page.getByRole('heading', { name: 'Evidence and uncertainty', exact: true })
  ).toBeVisible({ timeout: 30000 });
  await page.getByLabel('Skills for analysis', { exact: true }).fill('typescript, testing');
  await page
    .getByRole('combobox', { name: 'Installed AI model', exact: true })
    .selectOption('gemma3:4b');
  await page.getByRole('button', { name: /^Analyze (opportunity|again)$/ }).click();
  await expect(page.getByText('Analysis complete and saved locally.', { exact: true })).toBeVisible(
    { timeout: 125000 }
  );
  await expect(
    page.getByRole('heading', { name: 'Evidence citations · exact excerpts', exact: true })
  ).toBeVisible();
  await page.screenshot({ path: resolve(directory, 'real-analysis.png'), fullPage: true });
  await page
    .getByRole('heading', { name: 'Unknowns and questions', exact: true })
    .scrollIntoViewIfNeeded();
  // Pacing for the recording, not a readiness check.
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: 'Save opportunity', exact: true }).click();
  await expect(page.getByText('Saved to your local pipeline.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Pipeline', exact: true }).click();
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  await page.screenshot({ path: resolve(directory, 'real-pipeline.png'), fullPage: true });
  await page.waitForTimeout(1800);
  const detailUrl = await page.getByRole('link', { name: title, exact: true }).getAttribute('href');
  await page.goto(`${base.origin}/overview`);
  await page.screenshot({ path: resolve(directory, 'real-overview.png') });
  writeFileSync(
    resolve(directory, 'capture.json'),
    JSON.stringify(
      {
        started,
        completed: new Date().toISOString(),
        repo,
        title,
        detailUrl,
        source:
          'Actual application UI, live GitHub and actual local Gemma 4B. No mocked requests. Saved locally; nothing published.',
        video: await video.path()
      },
      null,
      2
    )
  );
} finally {
  await context.close();
  await browser.close();
}
console.log(`Demo artifacts: ${directory}`);
