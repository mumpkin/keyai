import type { Platform } from '../types.ts';
import { saveFileWithDialog } from './save-file-dialog.ts';
import { createTauriStorage } from './storage.ts';
import { createTauriWindowControls } from './window-controls.ts';

export async function createPlatform(): Promise<Platform> {
	return {
		name: 'tauri',
		storage: await createTauriStorage(),
		playsSplashOnEveryLaunch: true,
		windowControls: createTauriWindowControls(),
		// The updater comes with the desktop release.
		watchForUpdate: () => undefined,
		exportFile: saveFileWithDialog,
	};
}
