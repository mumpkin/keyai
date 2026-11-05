import AxeBuilder from '@axe-core/playwright';
import { KANA_CATALOGUE } from '@keyai/core/kana';
import { expect, test } from '@playwright/test';
import {
	openApp,
	openScreen,
	playSeries,
	SETTINGS,
	STATISTICS,
	TRAINING,
} from './helpers.ts';

const RULES = [
	'wcag2a',
	'wcag2aa',
	'wcag21a',
	'wcag21aa',
	'wcag22aa',
	'best-practice',
];

for (const colorScheme of ['light', 'dark'] as const) {
	test(`has no accessibility violation in ${colorScheme}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme });
		await openApp(page);
		await page.getByRole('button', { name: '10', exact: true }).click();
		await playSeries(page);
		for (const screen of [TRAINING, STATISTICS, SETTINGS]) {
			await openScreen(page, screen).click();
			await page.waitForTimeout(400);
			const { violations } = await new AxeBuilder({ page })
				.withTags(RULES)
				.analyze();
			expect(
				violations.map(({ id, nodes }) => `${id}: ${nodes[0]?.html}`),
			).toEqual([]);
		}
	});
}

test('stays accessible with every kana unlocked', async ({ page }) => {
	await openApp(page);
	await page.evaluate(
		([key, unlocked]) => {
			const save = JSON.parse(localStorage.getItem(key as string) ?? '');
			save.progress.unlocked = unlocked;
			localStorage.setItem(key as string, JSON.stringify(save));
		},
		['keyai.save', KANA_CATALOGUE.map((unit) => unit.text)],
	);
	await page.reload();
	await page.keyboard.press('Escape');
	const { violations } = await new AxeBuilder({ page })
		.withTags(RULES)
		.analyze();
	expect(
		violations.map(({ id, nodes }) => `${id}: ${nodes[0]?.html}`),
	).toEqual([]);
});

test('marks Japanese text and announces the end of a series', async ({
	page,
}) => {
	await openApp(page);
	await expect(
		page.locator('[data-word-index] [lang="ja"]').first(),
	).toBeAttached();
	await page.getByRole('button', { name: '10', exact: true }).click();
	await playSeries(page);
	await expect(page.getByRole('status')).toContainText('Série terminée');
});
