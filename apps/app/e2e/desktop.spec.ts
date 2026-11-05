import { expect, test } from '@playwright/test';
import {
	openApp,
	openScreen,
	playSeries,
	STATISTICS,
	TRAINING,
	typeCurrentWord,
} from './helpers.ts';

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

test('keeps the series while visiting another screen', async ({ page }) => {
	await typeCurrentWord(page);
	await openScreen(page, STATISTICS).click();
	await openScreen(page, TRAINING).click();
	await expect(page.getByText(/^1\/\d+$/)).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(page.getByText(/^0\/\d+$/)).toBeVisible();
});

test('says when the keys go nowhere', async ({ page }) => {
	// Always in the page, so that it moves nothing: only its opacity changes.
	const hint = page.getByText('reprendre la frappe').locator('..');
	await expect(hint).toHaveCSS('opacity', '0');

	await page.locator('header h1').click();
	await expect(hint).toHaveCSS('opacity', '1');

	await page.locator('main').click({ position: { x: 300, y: 200 } });
	await expect(hint).toHaveCSS('opacity', '0');
	await typeCurrentWord(page);
	await expect(page.getByText(/^1\/\d+$/)).toBeVisible();
});

test('guides the first series only', async ({ page }) => {
	const guide = page.getByText(/^Tapez chaque mot/);
	await expect(guide).toBeVisible();

	await page.getByRole('button', { name: '10', exact: true }).click();
	await playSeries(page);
	await expect(guide).toBeHidden();
});

test('moves between the kana tabs with the arrow keys', async ({ page }) => {
	await page.getByRole('tab', { name: 'Hiragana' }).focus();
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('tab', { name: 'Katakana' })).toBeFocused();
	await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Katakana');
});

test('does not stop on every kana with the Tab key', async ({ page }) => {
	const stops = await page.evaluate(
		() =>
			[
				...document.querySelectorAll<HTMLElement>(
					'a[href],button,input',
				),
			].filter((node) => node.tabIndex >= 0 && node.offsetParent).length,
	);
	expect(stops).toBeLessThan(20);
});
