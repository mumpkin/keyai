import type { Platform } from '@/platform/types.ts';
import { downloadFile } from './download-file.ts';
import { createWebStorage } from './storage.ts';
import { watchForWebUpdate } from './update.ts';

export function createPlatform(): Platform {
	return {
		name: 'web',
		storage: createWebStorage(),
		playsSplashOnEveryLaunch: false,
		windowControls: null,
		openLink: null,
		watchForUpdate: watchForWebUpdate,
		exportFile: downloadFile,
	};
}
