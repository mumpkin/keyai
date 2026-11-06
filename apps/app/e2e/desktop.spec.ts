import { readFileSync } from 'node:fs';
import { toHepburn, tokenize } from '@keyai/core/input';
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
	const guide = page.getByText(/^Tape les mots/);
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
	await page.getByRole('switch', { name: /Garder les espaces/ }).click();
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

test('still lets people validate each word with space', async ({ page }) => {
	await openScreen(page, SETTINGS).click();
	await page.getByRole('switch', { name: /Écriture naturelle/ }).click();
	await expect(
		page.getByRole('switch', { name: /Garder les espaces/ }),
	).toBeDisabled();
	await openScreen(page, TRAINING).click();
	await page.getByRole('button', { name: '10', exact: true }).click();
	await playSeries(page);
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

test('keeps the gaps between words by default', async ({ page }) => {
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

test('types a quote, then replays it or goes to the next one', async ({
	page,
}) => {
	await page.getByRole('button', { name: 'Citations' }).click();
	const words = page.locator('[data-word-index]');
	const quoteKeys = async () => {
		const kana = (await words.allTextContents()).join('');
		await page.keyboard.type(toHepburn(tokenize(kana)));
	};
	const first = await words.allTextContents();
	await quoteKeys();
	await expect(page.getByRole('button', { name: /Suivante/ })).toBeVisible();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('button', { name: /Suivante/ })).toBeHidden();
	expect(await words.allTextContents()).toEqual(first);
	await quoteKeys();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('button', { name: /Suivante/ })).toBeHidden();
	expect(await words.allTextContents()).not.toEqual(first);
});

test('shows furigana, and types the same reading', async ({ page }) => {
	await page.getByRole('button', { name: 'Citations' }).click();
	const furigana = page.getByRole('button', { name: 'Kanji + furigana' });
	await furigana.click();
	const ruby = page.locator('ruby').first();
	// A few quotes are in kana only.
	while ((await ruby.count()) === 0) {
		await page.keyboard.press('Escape');
	}
	await page.getByRole('button', { name: 'Kana', exact: true }).click();
	const kana = (
		await page.locator('[data-word-index]').allTextContents()
	).join('');
	await furigana.click();
	await expect(ruby.locator('rt')).toBeVisible();
	await page.keyboard.type(toHepburn(tokenize(kana)).slice(0, -1));
	await expect(
		page.locator('rt .text-typed-foreground').first(),
	).toBeAttached();
	await page.keyboard.type(toHepburn(tokenize(kana)).slice(-1));
	await expect(page.getByRole('button', { name: /Suivante/ })).toBeVisible();
});

test('hides furigana until enough wrong keys in kanji only', async ({
	page,
}) => {
	await page.getByRole('button', { name: 'Citations' }).click();
	await page.getByRole('button', { name: 'Kanji seuls' }).click();
	const firstKanji = page.locator('[data-word-index="0"] ruby');
	while ((await firstKanji.count()) === 0) {
		await page.keyboard.press('Escape');
	}
	await expect(firstKanji.locator('rt').first()).toBeHidden();
	await page.keyboard.type('qq');
	await expect(firstKanji.locator('rt').first()).toBeVisible();
});

test('opens the card of a word of a finished quote', async ({ page }) => {
	await page.getByRole('button', { name: 'Citations' }).click();
	const words = page.locator('[data-word-index]');
	const kana = (await words.allTextContents()).join('');
	await page.keyboard.type(toHepburn(tokenize(kana)));
	await words.first().hover();
	await expect(
		page.getByRole('button', { name: 'Ajouter à ma liste Anki' }),
	).toBeVisible();
});

test('offers a support link that can be turned off, except in About', async ({
	page,
}) => {
	const links = page.getByRole('link', { name: 'Offre-moi un café' });
	await expect(links).toHaveCount(1);
	await expect(links.first()).toHaveAttribute(
		'href',
		'https://buymeacoffee.com/mumpkin',
	);
	await openScreen(page, SETTINGS).click();
	await expect(links).toHaveCount(2);
	await page.getByRole('switch', { name: /bouton de soutien/ }).click();
	await expect(links).toHaveCount(1);
	await expect(page.getByText('Désactivable dans les réglages')).toBeHidden();
});
