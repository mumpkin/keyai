import type { SaveStorage } from '@/platform/types.ts';

export const SAVE_KEY = 'keyai.save';
const UNREADABLE_SAVE_KEY = 'keyai.save.unreadable';

/**
 * Browser storage: localStorage, after asking the browser not to evict the
 * site data when the disk runs low (A6, step 6).
 */
export function createWebStorage(
	storage: Storage = localStorage,
	events: Pick<Window, 'addEventListener'> = window,
): SaveStorage {
	void navigator.storage?.persist?.();
	return {
		load: () => Promise.resolve(storage.getItem(SAVE_KEY)),
		save: (content) => {
			storage.setItem(SAVE_KEY, content);
			return Promise.resolve();
		},
		keepUnreadable: (content) => {
			storage.setItem(UNREADABLE_SAVE_KEY, content);
			return Promise.resolve();
		},
		loadUnreadable: () =>
			Promise.resolve(storage.getItem(UNREADABLE_SAVE_KEY)),
		onExternalSave: (listener) =>
			events.addEventListener('storage', ({ key, newValue }) => {
				if (key === SAVE_KEY && newValue !== null) {
					listener(newValue);
				}
			}),
	};
}
