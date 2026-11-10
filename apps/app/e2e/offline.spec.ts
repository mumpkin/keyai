import { toHepburn, tokenize } from '@keyai/core/input';
import { expect, type Page, test } from '@playwright/test';
import { openApp } from './helpers.ts';

/** Waits until the service worker has cached the app and controls the page. */
async function installOfflineCache(page: Page): Promise<void> {
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	await expect
		.poll(() =>
			page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
		)
		.toBe(true);
}

test('types a quote offline', async ({ page, context }) => {
	await openApp(page);
	await installOfflineCache(page);

	await context.setOffline(true);
	await page.reload();
	await page.locator('header').waitFor();

	await page.getByRole('button', { name: 'Citations' }).click();
	const words = page.locator('[data-word-index]');
	const kana = (await words.allTextContents()).join('');
	await page.locator('input[aria-label="Zone de frappe"]').focus();
	await page.keyboard.type(toHepburn(tokenize(kana)));
	await expect(page.getByRole('button', { name: /Suivante/ })).toBeVisible();
	await page.getByRole('button', { name: /Suivante/ }).click();
	await expect(words.first()).toBeVisible();
});
