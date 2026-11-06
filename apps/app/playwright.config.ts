import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const PHONE_TESTS = /(phone|accessibility)\.spec\.ts/;
const DESKTOP_TESTS = /(desktop|tour|accessibility)\.spec\.ts/;

export default defineConfig({
	testDir: './e2e',
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		// biome-ignore lint/style/useNamingConvention: option name of Playwright
		baseURL: `http://localhost:${PORT}`,
		locale: 'fr-FR',
		trace: 'retain-on-failure',
	},
	webServer: {
		command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: 'small phone',
			testMatch: PHONE_TESTS,
			use: { ...devices['iPhone SE'], defaultBrowserType: 'chromium' },
		},
		{
			name: 'android phone',
			testMatch: PHONE_TESTS,
			use: devices['Pixel 7'],
		},
		{
			name: 'desktop',
			testMatch: DESKTOP_TESTS,
			use: devices['Desktop Chrome'],
		},
		// WebKit cannot be installed everywhere: it only runs in the CI.
		...(process.env.CI
			? [
					{
						name: 'iphone',
						testMatch: PHONE_TESTS,
						use: devices['iPhone 15'],
					},
				]
			: []),
	],
});
