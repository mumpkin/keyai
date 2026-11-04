import { describe, expect, it } from 'vitest';
import { createWebStorage, SAVE_KEY } from './storage.ts';

function memoryStorage(): Storage {
	const items = new Map<string, string>();
	return {
		get length() {
			return items.size;
		},
		clear: () => items.clear(),
		getItem: (key) => items.get(key) ?? null,
		key: (index) => [...items.keys()][index] ?? null,
		removeItem: (key) => items.delete(key),
		setItem: (key, value) => items.set(key, value),
	};
}

describe('createWebStorage', () => {
	it('saves and loads the save file', async () => {
		const backing = memoryStorage();
		const storage = createWebStorage(backing);
		expect(await storage.load()).toBeNull();
		await storage.save('{"format":"keyai-save"}');
		expect(backing.getItem(SAVE_KEY)).toBe('{"format":"keyai-save"}');
		expect(await storage.load()).toBe('{"format":"keyai-save"}');
	});

	it('keeps an unreadable save apart from the save file', async () => {
		const storage = createWebStorage(memoryStorage());
		expect(await storage.loadUnreadable()).toBeNull();
		await storage.keepUnreadable('{broken');
		await storage.save('{"format":"keyai-save"}');
		expect(await storage.loadUnreadable()).toBe('{broken');
	});
});
