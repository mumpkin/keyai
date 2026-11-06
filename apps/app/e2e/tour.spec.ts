import { expect, test } from '@playwright/test';
import { openApp, openScreen, SETTINGS } from './helpers.ts';

test.describe('once in the app', () => {
	test.beforeEach(async ({ page }) => {
		await openApp(page);
	});

	test('visits the whole app and comes back without side effects', async ({
		page,
	}) => {
		await openScreen(page, SETTINGS).click();
		await page.getByRole('button', { name: 'Relancer la visite' }).click();
		await expect(page.getByText('Bienvenue !')).toBeVisible();
		await expect(page.getByText('1/17')).toBeVisible();
		await page.keyboard.type('abc');
		for (let step = 2; step <= 17; step += 1) {
			await page.getByRole('button', { name: 'Suivant' }).click();
			await expect(page.getByText(`${step}/17`)).toBeInViewport({
				ratio: 1,
			});
		}
		await page.getByRole('button', { name: 'Terminer' }).click();
		await expect(
			page.getByRole('button', { name: 'Mots' }),
		).toHaveAttribute('aria-pressed', 'true');
		await expect(page.getByText('0 erreur')).toBeVisible();
		await expect(page.getByLabel('Zone de frappe')).toBeFocused();
	});

	test('can be left at any step', async ({ page }) => {
		await openScreen(page, SETTINGS).click();
		await page.getByRole('button', { name: 'Relancer la visite' }).click();
		await page.getByRole('button', { name: 'Passer' }).click();
		await expect(page.getByText('1/17')).toBeHidden();
		await expect(page.getByRole('button', { name: 'Mots' })).toBeVisible();
	});
});

test('closes the offer before starting the tour', async ({ page }) => {
	await page.goto('/');
	await page.locator('header').waitFor();
	await page.keyboard.press('Escape');
	await page.getByRole('button', { name: /Oui/ }).click();
	await expect(page.getByText('Première fois ici ?')).toBeHidden();
	await expect(page.getByText('1/17')).toBeVisible();
	await expect(
		page.locator('[data-slot="alert-dialog-overlay"]'),
	).toHaveCount(0);
	await page.getByRole('button', { name: 'Suivant' }).click();
	await expect(page.getByText('2/17')).toBeVisible();
});
