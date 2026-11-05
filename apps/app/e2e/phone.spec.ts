import { expect, test } from '@playwright/test';
import {
	masterKana,
	openApp,
	openScreen,
	SETTINGS,
	STATISTICS,
	sidewaysOverflow,
	TRAINING,
	typeCurrentWord,
} from './helpers.ts';

/** What stays visible above the keyboard on a small phone. */
const HEIGHT_ABOVE_KEYBOARD = 400;

test.beforeEach(async ({ page }) => {
	await openApp(page);
});

test('keeps the words above the virtual keyboard', async ({ page }) => {
	// A keyboard covers the page without resizing it: the words must already
	// sit in the part of the screen that stays visible, without scrolling.
	const word = page.locator('[data-word-index]').first();
	const line = await word.locator('xpath=../..').boundingBox();
	expect((line?.y ?? 0) + (line?.height ?? 0)).toBeLessThanOrEqual(
		HEIGHT_ABOVE_KEYBOARD,
	);
});

test('types words on a phone', async ({ page }) => {
	await typeCurrentWord(page);
	await expect(page.getByText(/^1\/\d+$/)).toBeVisible();
});

test('never scrolls sideways', async ({ page }) => {
	for (const screen of [TRAINING, STATISTICS, SETTINGS]) {
		await openScreen(page, screen).click();
		await page.waitForTimeout(300);
		expect(await sidewaysOverflow(page)).toEqual([]);
	}
});

test('shows only the kana to work on', async ({ page }) => {
	const mastered = await masterKana(page, 4);
	const list = page.getByRole('list', { name: 'Kana à travailler' });

	await expect(list).toBeVisible();
	for (const kana of mastered) {
		await expect(list.getByText(kana, { exact: true })).toHaveCount(0);
	}
	await expect(page.getByText('4 maîtrisés')).toBeVisible();
	await expect(list.getByText('suivant')).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Katakana' })).toBeHidden();
});

test('says what holds the next kana back', async ({ page }) => {
	await expect(
		page.getByText(/^Pour débloquer/).locator('visible=true'),
	).toBeVisible();
	await expect(page.getByText('0 %').first()).toBeVisible();
});

test('lays the kana out without any overlap', async ({ page }) => {
	const list = page.getByRole('list', { name: 'Kana à travailler' });
	const cells = await list.getByRole('listitem').evaluateAll((items) =>
		items.map((item) => {
			const { left, right, top, bottom } = item.getBoundingClientRect();
			return { left, right, top, bottom };
		}),
	);
	expect(cells.length).toBeGreaterThan(1);
	const { width } = page.viewportSize() ?? { width: 0 };
	for (const [index, cell] of cells.entries()) {
		expect(cell.right).toBeLessThanOrEqual(width);
		for (const other of cells.slice(index + 1)) {
			const overlaps =
				cell.left < other.right &&
				other.left < cell.right &&
				cell.top < other.bottom &&
				other.top < cell.bottom;
			expect(overlaps).toBe(false);
		}
	}
});

test('shows the same kana in the statistics', async ({ page }) => {
	await openScreen(page, STATISTICS).click();
	await expect(
		page.getByRole('list', { name: 'Kana à travailler' }),
	).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Katakana' })).toBeHidden();
});
