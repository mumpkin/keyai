import { openUrl } from '@tauri-apps/plugin-opener';
import type { Platform } from '../types.ts';
import { saveFileWithDialog } from './save-file-dialog.ts';
import { createTauriStorage } from './storage.ts';
import { watchForDesktopUpdate } from './update.ts';
import { createTauriWindowControls } from './window-controls.ts';

export async function createPlatform(): Promise<Platform> {
	return {
		name: 'tauri',
		storage: await createTauriStorage(),
		playsSplashOnEveryLaunch: true,
		windowControls: createTauriWindowControls(),
		openLink: (url) => void openUrl(url),
		watchForUpdate: (onReady) => void watchForDesktopUpdate(onReady),
		exportFile: saveFileWithDialog,
	};
}
