import type { Platform } from '../types.ts';
import { createTauriStorage } from './storage.ts';

export async function createPlatform(): Promise<Platform> {
	return {
		name: 'tauri',
		storage: await createTauriStorage(),
		playsSplashOnEveryLaunch: true,
	};
}
