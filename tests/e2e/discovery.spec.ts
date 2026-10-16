import { test, expect } from '@playwright/test';

test('search works without Ollama and exposes source uncertainty and score details', async ({ page }) => {
  // Synthetic API fixture only; live GitHub verification is recorded separately.
  await page.route('**/api/opportunities?*', route => route.fulfill({ json: { data: {
    items: [{ id: '123', owner: 'synthetic-owner', repo: 'fixture', number: 7, url: 'https://github.com/synthetic-owner/fixture/issues/7', title: 'Synthetic fixture opportunity', state: 'open', locked: false, labels: ['bounty'], assignees: [], updatedAt: '2026-10-16T00:00:00Z', paidEvidence: { state: 'signal_only' }, score: { total: 25, parts: { evidence: 10, skills: 0, recency: 0, availability: 15, scope: 0 }, warnings: [] }, saved: false }],
    page: 1, hasNext: false, totalCount: 1, observedAt: '2026-10-16T00:00:00Z', cache: 'miss', warnings: ['Issue-only payment signals do not confirm funding.'], rateLimit: { remaining: 9 },
  } } }));
  await page.goto('/');
  await expect(page.getByText('AI is disabled.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Search GitHub', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1 provider matches' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Synthetic fixture opportunity' })).toHaveAttribute('href', '/opportunities/synthetic-owner/fixture/7');
  await page.getByText('Score 25/100 · page-local heuristic').click();
  await expect(page.getByText('evidence: 10', { exact: true })).toBeVisible();
  await expect(page.getByText('Issue-only payment signals do not confirm funding.')).toBeVisible();
});
test('shows a quota error with retry guidance and keeps filters editable', async ({ page }) => {
  await page.route('**/api/opportunities?*', route => route.fulfill({ status: 429, json: { error: { message: 'GitHub quota is exhausted.', retryAt: '2030-01-01T00:00:00Z' } } }));
  await page.goto('/'); await page.getByRole('button', { name: 'Search GitHub', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('GitHub quota is exhausted.');
  await expect(page.getByRole('status')).toContainText('Retry after');
  await expect(page.getByLabel('Keywords', { exact: true })).toBeEditable();
});
