import { relaunch } from '@tauri-apps/plugin-process';
import { check } from '@tauri-apps/plugin-updater';

interface AvailableUpdate {
	readonly downloadAndInstall: () => Promise<void>;
}

export interface UpdateActions {
	readonly checkForUpdate: () => Promise<AvailableUpdate | null>;
	readonly restart: () => Promise<void>;
}

const TAURI_ACTIONS: UpdateActions = {
	checkForUpdate: check,
	restart: relaunch,
};

/**
 * Looks for a new release at launch and only offers it: nothing is downloaded
 * before the user asks for it. Being offline just means no offer.
 */
export async function watchForDesktopUpdate(
	onReady: (apply: () => Promise<void>) => void,
	actions: UpdateActions = TAURI_ACTIONS,
): Promise<void> {
	const update = await actions.checkForUpdate().catch(() => null);
	if (update) {
		onReady(async () => {
			await update.downloadAndInstall();
			await actions.restart();
		});
	}
}
