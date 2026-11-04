import type { Platform } from '../types.ts';
import { downloadFile } from './download-file.ts';
import { createWebStorage } from './storage.ts';

export function createPlatform(): Platform {
	return {
		name: 'web',
		storage: createWebStorage(),
		playsSplashOnEveryLaunch: false,
		windowControls: null,
		exportFile: downloadFile,
	};
}
