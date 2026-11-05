import { serializeSave } from '@keyai/core/save';
import { describe, expect, it } from 'vitest';
import type { SaveStorage } from '@/platform/index.ts';
import { vocabularyOf } from '@/vocab/vocabulary.ts';
import { freshSave } from './progress-logic.ts';
import { createProgressStore } from './progress-store.ts';

const VOCABULARY = vocabularyOf({
	schemaVersion: 1,
	sources: { jmdict: 'test', wordfreq: 'test' },
	unlockOrder: ['い', 'ぬ'],
	initialUnlocked: 2,
	words: [
		{
			id: 'dog',
			kana: 'いぬ',
			rank: 1,
			senses: [{ gloss: { en: 'dog' }, pos: ['noun'] }],
		},
	],
});
const NOW = new Date('2026-11-04T12:00:00.000Z');

function storageWith(content: string | null, keptCopy: string | null = null) {
	const state = {
		content,
		keptCopy,
		writes: 0,
		fromOtherTab: (_content: string): void => undefined,
	};
	const storage: SaveStorage = {
		load: () => Promise.resolve(state.content),
		save: (saved) => {
			state.content = saved;
			state.writes += 1;
			return Promise.resolve();
		},
		keepUnreadable: (copy) => {
			state.keptCopy = copy;
			return Promise.resolve();
		},
		loadUnreadable: () => Promise.resolve(state.keptCopy),
		onExternalSave: (listener) => {
			state.fromOtherTab = listener;
		},
	};
	return { state, storage };
}

function storeOn(storage: SaveStorage) {
	return createProgressStore({
		storage,
		vocabulary: VOCABULARY,
		appVersion: '0.1.0',
		languages: ['fr'],
		now: () => NOW,
	});
}

describe('createProgressStore', () => {
	it('sets an unreadable save aside before anything replaces it', async () => {
		const { state, storage } = storageWith('{broken');
		const store = await storeOn(storage);

		expect(store.getState().loadIssue).toBe('invalidJson');
		expect(store.getState().unreadableCopy).toBe('{broken');
		expect(state.content).toBe('{broken');

		store.getState().resetProgress();

		expect(state.content).not.toBe('{broken');
		expect(state.keptCopy).toBe('{broken');
	});

	it('still starts when the copy cannot be stored', async () => {
		const { storage } = storageWith('{broken');
		const store = await storeOn({
			...storage,
			keepUnreadable: () => Promise.reject(new Error('disk full')),
		});
		expect(store.getState().unreadableCopy).toBe('{broken');
	});

	it('finds a copy kept during an earlier launch', async () => {
		const context = {
			vocabulary: VOCABULARY,
			appVersion: '0.1.0',
			now: NOW,
		};
		const readable = serializeSave(freshSave(context, ['fr']));
		const { storage } = storageWith(readable, '{broken');
		const store = await storeOn(storage);

		expect(store.getState().loadIssue).toBeNull();
		expect(store.getState().unreadableCopy).toBe('{broken');
	});

	it('follows the saves of another tab without writing them back', async () => {
		const context = {
			vocabulary: VOCABULARY,
			appVersion: '0.1.0',
			now: NOW,
		};
		const { state, storage } = storageWith(null);
		const store = await storeOn(storage);
		const writesBefore = state.writes;
		const other = freshSave(context, ['en']);

		state.fromOtherTab(serializeSave(other));

		expect(store.getState().save.settings.locale).toBe('en');
		expect(state.writes).toBe(writesBefore);
	});

	it('ignores an unreadable save from another tab', async () => {
		const { state, storage } = storageWith(null);
		const store = await storeOn(storage);
		const { save } = store.getState();

		state.fromOtherTab('{broken');

		expect(store.getState().save).toBe(save);
	});

	it('has no copy when every save was readable', async () => {
		const { storage } = storageWith(null);
		const store = await storeOn(storage);
		expect(store.getState().unreadableCopy).toBeNull();
	});
});
