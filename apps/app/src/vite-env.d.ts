/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PLATFORM: 'web' | 'tauri';
	/** Set by `pages.yml` when a desktop release can be downloaded. */
	readonly VITE_DESKTOP_RELEASE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
