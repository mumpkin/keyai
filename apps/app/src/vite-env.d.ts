/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PLATFORM: 'web' | 'tauri';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
