import { toHepburn, tokenize } from '@keyai/core/input';
import type { Page } from '@playwright/test';

const SAVE_KEY = 'keyai.save';

export async function openApp(page: Page): Promise<void> {
	await page.goto('/');
	await page.locator('header').waitFor();
	await page.keyboard.press('Escape');
	await page.locator('button.fixed').waitFor({ state: 'detached' });
}

export function openScreen(page: Page, position: number) {
	return page
		.getByRole('navigation')
		.getByRole('button', { name: /Entraînement|Statistiques|Réglages/ })
		.nth(position);
}

export const TRAINING = 0;
export const STATISTICS = 1;
export const SETTINGS = 2;

/** Makes the first kana of the unlock order mastered, then reloads. */
export async function masterKana(page: Page, count: number): Promise<string[]> {
	const mastered = await page.evaluate(
		([key, wanted]) => {
			const save = JSON.parse(localStorage.getItem(key as string) ?? '');
			const kana: string[] = save.progress.unlocked.slice(
				0,
				wanted as number,
			);
			const recent = Array.from({ length: 10 }, () => ({
				ms: 500,
				error: false,
			}));
			for (const item of kana) {
				save.progress.kana[item] = { seen: 10, errors: 0, recent };
			}
			localStorage.setItem(key as string, JSON.stringify(save));
			return kana;
		},
		[SAVE_KEY, count] as const,
	);
	await page.reload();
	await page.locator('header').waitFor();
	return mastered;
}

export async function typeCurrentWord(page: Page): Promise<void> {
	const word = await page.locator('[data-word-index]').first().textContent();
	await page.keyboard.type(toHepburn(tokenize(word ?? '')));
	await page.keyboard.press('Space');
}

export async function playSeries(page: Page): Promise<void> {
	const words = await page.locator('[data-word-index]').allTextContents();
	for (const [index, word] of words.entries()) {
		await page.keyboard.type(toHepburn(tokenize(word)));
		if (index < words.length - 1) {
			await page.keyboard.press('Space');
		}
	}
}

/** Types every word one after the other, without any space. */
export async function playNaturalSeries(page: Page): Promise<void> {
	const words = await page.locator('[data-word-index]').allTextContents();
	for (const word of words) {
		await page.keyboard.type(toHepburn(tokenize(word)));
	}
}

/** Whether anything can be scrolled sideways, on the page or in a box. */
export function sidewaysOverflow(page: Page): Promise<string[]> {
	return page.evaluate(() =>
		[document.documentElement, ...document.querySelectorAll('main *')]
			.filter((node) => {
				const { overflowX } = getComputedStyle(node);
				const scrolls =
					node === document.documentElement ||
					overflowX === 'auto' ||
					overflowX === 'scroll';
				return scrolls && node.scrollWidth > node.clientWidth;
			})
			.map((node) => node.tagName),
	);
}
