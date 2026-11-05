import { expect, test } from '@playwright/test';
import { openApp, playSeries, typeCurrentWord } from './helpers.ts';

test.beforeEach(async ({ page }) => {
	await openApp(page);
});

test('keeps the full kana table', async ({ page }) => {
	await expect(page.getByRole('tab', { name: 'Katakana' })).toBeVisible();
	await expect(
		page.getByRole('list', { name: 'Kana à travailler' }),
	).toBeHidden();
});

test('types a word', async ({ page }) => {
	await typeCurrentWord(page);
	await expect(page.getByText(/^1\/\d+$/)).toBeVisible();
});

test('never loses the progress of another tab', async ({ context, page }) => {
	const otherTab = await context.newPage();
	await otherTab.goto('/');
	await otherTab.locator('header').waitFor();

	await page.bringToFront();
	await page.getByRole('button', { name: '10', exact: true }).click();
	await playSeries(page);
	const history = (tab: typeof page) =>
		tab.evaluate(
			() =>
				JSON.parse(localStorage.getItem('keyai.save') ?? '{}').history
					.length,
		);
	expect(await history(page)).toBe(1);

	await otherTab.bringToFront();
	await otherTab.getByRole('button', { name: '50', exact: true }).click();
	await expect.poll(() => history(otherTab)).toBe(1);
});
