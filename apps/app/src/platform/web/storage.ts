import type { SaveStorage } from '../types.ts';

export const SAVE_KEY = 'keyai.save';

/**
 * Browser storage: localStorage, after asking the browser not to evict the
 * site data when the disk runs low (A6, step 6).
 */
export function createWebStorage(storage: Storage = localStorage): SaveStorage {
	void navigator.storage?.persist?.();
	return {
		load: () => Promise.resolve(storage.getItem(SAVE_KEY)),
		save: (content) => {
			storage.setItem(SAVE_KEY, content);
			return Promise.resolve();
		},
	};
}
