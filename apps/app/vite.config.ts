import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { type ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const TAURI_DEV_PORT = 1420;

/** Single application version, read from the root `package.json` (A7). */
const appVersion: string = JSON.parse(
	readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
).version;

/** Everything is cached at install: the app must work offline (spec 9). */
const PRECACHED_FILES = '**/*.{js,css,html,svg,png,woff2}';

const WEB_APP_MANIFEST: Partial<ManifestOptions> = {
	name: 'keyai',
	// biome-ignore lint/style/useNamingConvention: name set by the manifest format
	short_name: 'keyai',
	description: 'Learn to read Japanese kana by typing them',
	// biome-ignore lint/style/useNamingConvention: name set by the manifest format
	start_url: '.',
	scope: '.',
	display: 'standalone',
	// biome-ignore lint/style/useNamingConvention: name set by the manifest format
	background_color: '#e6e7ed',
	// biome-ignore lint/style/useNamingConvention: name set by the manifest format
	theme_color: '#e6e7ed',
	icons: [
		{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
		{ src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
		{
			src: 'pwa-maskable-512.png',
			sizes: '512x512',
			type: 'image/png',
			purpose: 'maskable',
		},
	],
};

export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		tailwindcss(),
		VitePWA({
			// The desktop app has its own updater.
			disable: mode === 'tauri',
			// Updates are offered, never forced during a series.
			registerType: 'prompt',
			injectRegister: false,
			manifest: WEB_APP_MANIFEST,
			workbox: {
				globPatterns: [PRECACHED_FILES],
				cleanupOutdatedCaches: true,
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	define: {
		// biome-ignore lint/style/useNamingConvention: global replaced at build time
		__APP_VERSION__: JSON.stringify(appVersion),
	},
	clearScreen: false,
	server: {
		port: TAURI_DEV_PORT,
		strictPort: true,
	},
}));
