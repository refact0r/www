import { expect, test } from '@playwright/test';

test('homepage renders its introduction and background effect', async ({ page }) => {
	const pageErrors = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));

	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'refact0r' })).toBeVisible();
	await expect(
		page.getByText("hey there! i'm yifan. i care about how software works, learns, and feels.")
	).toBeVisible();
	await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(1);
	expect(pageErrors).toEqual([]);
});
