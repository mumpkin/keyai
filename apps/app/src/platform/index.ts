import type { Platform } from './types.ts';

/**
 * Picks the platform at build time (`VITE_PLATFORM`): the web build never
 * contains the Tauri code, and the other way round (A5).
 */
export async function loadPlatform(): Promise<Platform> {
	if (import.meta.env.VITE_PLATFORM === 'tauri') {
		const { createPlatform } = await import('./tauri/index.ts');
		return createPlatform();
	}
	const { createPlatform } = await import('./web/index.ts');
	return createPlatform();
}

export type { Platform, SaveStorage, WindowControls } from './types.ts';
