import { load } from '@tauri-apps/plugin-store';
import type { SaveStorage } from '../types.ts';

const STORE_FILE = 'keyai-save.json';
const SAVE_ENTRY = 'save';

/**
 * Desktop storage: a JSON file in the app data folder. Unlike the webview
 * storage, it survives a change of the app origin (A6, step 6).
 */
export async function createTauriStorage(): Promise<SaveStorage> {
	const store = await load(STORE_FILE, { defaults: {}, autoSave: false });
	return {
		load: async () => (await store.get<string>(SAVE_ENTRY)) ?? null,
		save: async (content) => {
			await store.set(SAVE_ENTRY, content);
			await store.save();
		},
	};
}
