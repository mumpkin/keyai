import { expect, test } from '@playwright/test';
import { openApp, typeCurrentWord } from './helpers.ts';

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
