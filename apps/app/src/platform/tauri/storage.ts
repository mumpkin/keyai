import { load } from '@tauri-apps/plugin-store';
import type { SaveStorage } from '@/platform/types.ts';

const STORE_FILE = 'keyai-save.json';
const SAVE_ENTRY = 'save';
const UNREADABLE_SAVE_ENTRY = 'unreadableSave';

/**
 * Desktop storage: a JSON file in the app data folder. Unlike the webview
 * storage, it survives a change of the app origin (A6, step 6).
 */
export async function createTauriStorage(): Promise<SaveStorage> {
	const store = await load(STORE_FILE, { defaults: {}, autoSave: false });
	const write = async (entry: string, content: string) => {
		await store.set(entry, content);
		await store.save();
	};
	return {
		load: async () => (await store.get<string>(SAVE_ENTRY)) ?? null,
		save: (content) => write(SAVE_ENTRY, content),
		keepUnreadable: (content) => write(UNREADABLE_SAVE_ENTRY, content),
		loadUnreadable: async () =>
			(await store.get<string>(UNREADABLE_SAVE_ENTRY)) ?? null,
		// The desktop app has a single window.
		onExternalSave: () => undefined,
	};
}
