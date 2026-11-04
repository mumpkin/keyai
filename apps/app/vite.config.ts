import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const TAURI_DEV_PORT = 1420;

/** Single application version, read from the root `package.json` (A7). */
const appVersion: string = JSON.parse(
	readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
).version;

export default defineConfig({
	plugins: [
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		tailwindcss(),
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
});
