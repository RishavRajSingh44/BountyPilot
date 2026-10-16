import { expect, test } from '@playwright/test';

test('license and source remain available without AI or external navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'License, notices and source · AGPL-3.0-only' }).click();
  await expect(page.getByRole('heading', { name: 'License, notices and source' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Obtain the project source and build instructions' }))
    .toHaveAttribute('href', 'https://github.com/RishavRajSingh44/BountyPilot');
  await page.getByText('Application license', { exact: true }).click();
  await expect(page.locator('pre').first()).toContainText('GNU AFFERO GENERAL PUBLIC LICENSE');
  await expect(page.locator('pre').first()).toContainText('13. Remote Network Interaction');
  await page.getByText('shadcn/ui MIT notice', { exact: true }).click();
  await expect(page.locator('details').nth(2)).toContainText('Copyright (c) 2023 shadcn');
});
