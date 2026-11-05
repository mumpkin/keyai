import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
	openApp,
	openScreen,
	playNaturalSeries,
	playSeries,
	SETTINGS,
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
	await page.getByRole('tab', { name: 'Mes kana' }).focus();
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('tab', { name: 'Katakana' })).toBeFocused();
	await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Katakana');
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('tab', { name: 'Mes kana' })).toBeFocused();
});

test('opens on my kana, without choosing a script', async ({ page }) => {
	const panel = page.getByRole('tabpanel');
	await expect(panel).toHaveAccessibleName('Mes kana');
	await expect(panel.getByRole('img')).toHaveCount(12);
	await expect(panel.getByRole('img').first()).toHaveAccessibleName(/^は/);
});

test('remembers the kana tab across screens and launches', async ({ page }) => {
	await page.getByRole('tab', { name: 'Katakana' }).click();
	await openScreen(page, STATISTICS).click();
	await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Katakana');
	await page.reload();
	await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Katakana');
});

test('keeps the same height on every kana tab', async ({ page }) => {
	const heights = [];
	for (const name of ['Mes kana', 'Hiragana', 'Katakana']) {
		await page.getByRole('tab', { name }).click();
		const box = await page.getByRole('tabpanel').boundingBox();
		heights.push(box?.height);
	}
	expect(new Set(heights).size).toBe(1);
});

test('types a whole series without a space in natural writing', async ({
	page,
}) => {
	await openScreen(page, SETTINGS).click();
	await page.getByRole('switch', { name: /Écriture naturelle/ }).click();
	await openScreen(page, TRAINING).click();
	await page.getByRole('button', { name: '10', exact: true }).click();
	const first = page.locator('[data-word-index="0"]');
	const second = page.locator('[data-word-index="1"]');
	const firstBox = await first.boundingBox();
	const secondBox = await second.boundingBox();
	expect(secondBox?.x).toBe((firstBox?.x ?? 0) + (firstBox?.width ?? 0));
	await playNaturalSeries(page);
	await expect
		.poll(() =>
			page.evaluate(() => {
				const save = JSON.parse(
					localStorage.getItem('keyai.save') ?? '',
				);
				return save.history[0];
			}),
		)
		.toMatchObject({ wordCount: 10, accuracy: 1 });
});

test('can keep the gaps between words in natural writing', async ({ page }) => {
	await openScreen(page, SETTINGS).click();
	const spaces = page.getByRole('switch', { name: /Garder les espaces/ });
	await expect(spaces).toBeDisabled();
	await page.getByRole('switch', { name: /Écriture naturelle/ }).click();
	await spaces.click();
	await openScreen(page, TRAINING).click();
	const firstBox = await page.locator('[data-word-index="0"]').boundingBox();
	const secondBox = await page.locator('[data-word-index="1"]').boundingBox();
	expect(secondBox?.x).toBeGreaterThan(
		(firstBox?.x ?? 0) + (firstBox?.width ?? 0),
	);
	await playNaturalSeries(page);
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					JSON.parse(localStorage.getItem('keyai.save') ?? '').history
						.length,
			),
		)
		.toBe(1);
});

test('sets words aside from their card and exports them for Anki', async ({
	page,
}) => {
	await typeCurrentWord(page);
	await page.locator('[data-word-index="0"]').hover();
	await page.getByRole('button', { name: 'Ajouter à ma liste Anki' }).click();
	await expect(
		page.getByRole('button', { name: 'Retirer de ma liste Anki' }),
	).toBeVisible();
	await page.keyboard.press('Escape');
	await openScreen(page, STATISTICS).click();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Exporter pour Anki' }).click();
	const file = await download;
	expect(file.suggestedFilename()).toMatch(/^keyai-anki-.*\.txt$/);
	const content = readFileSync((await file.path()) ?? '', 'utf8');
	expect(content).toContain('#guid column:1');
	expect(content).toContain('keyai-');
	await expect(page.getByText(/Fichier enregistré/)).toBeVisible();
	await page.reload();
	await openScreen(page, STATISTICS).click();
	await expect(
		page.getByRole('button', { name: 'Exporter pour Anki' }),
	).toBeVisible();
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

test('lets people report a wrong translation', async ({ page }) => {
	const [word] = await page.locator('[data-word-index]').allTextContents();
	await typeCurrentWord(page);
	await page.locator('ul.grid > li button').first().hover();

	const link = page.getByRole('link', { name: 'Signaler une erreur' });
	await expect(link).toBeVisible();
	const url = new URL((await link.getAttribute('href')) ?? '');
	expect(url.searchParams.get('word')).toBe(word);
	expect(url.searchParams.get('current')).toBeTruthy();
});
