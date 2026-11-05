import type { SaveError, SaveFile } from '@keyai/core/save';
import { parseSave, serializeSave } from '@keyai/core/save';
import type { Settings } from '@keyai/core/settings';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { SaveStorage } from '@/platform/index.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import {
	alignedSave,
	type FinishedSeries,
	loadedSaveOf,
	type SaveContext,
	type SeriesResult,
	saveAfterReset,
	saveAfterSeries,
	saveWithAnkiWords,
	saveWithSettings,
} from './progress-logic.ts';

export interface ProgressDependencies {
	readonly storage: SaveStorage;
	readonly vocabulary: Vocabulary;
	readonly appVersion: string;
	readonly languages: readonly string[];
	readonly now: () => Date;
}

export interface ProgressState {
	readonly save: SaveFile;
	readonly loadIssue: SaveError | null;
	readonly isFirstLaunch: boolean;
	/** Copy of a save that could not be read, as it was stored. */
	readonly unreadableCopy: string | null;
	readonly applySeriesResult: (series: FinishedSeries) => SeriesResult;
	readonly updateSettings: (update: (settings: Settings) => Settings) => void;
	readonly updateAnkiWords: (
		update: (words: readonly string[]) => readonly string[],
	) => void;
	readonly replaceSave: (save: SaveFile) => void;
	readonly resetProgress: () => void;
}

export type ProgressStore = StoreApi<ProgressState>;

/**
 * Sets a save that cannot be read aside before anything replaces it. If even
 * that fails, the copy stays in memory: the app must start anyway.
 */
async function unreadableCopyOf(
	storage: SaveStorage,
	unreadable: string | null,
): Promise<string | null> {
	if (unreadable === null) {
		return storage.loadUnreadable();
	}
	await storage.keepUnreadable(unreadable).catch(() => undefined);
	return unreadable;
}

interface StorageSync {
	readonly storage: SaveStorage;
	readonly storedContent: string | null;
	readonly align: (save: SaveFile) => SaveFile;
}

/** Saves every change, and follows the saves of the other tabs. */
function syncWithStorage(store: ProgressStore, sync: StorageSync): void {
	/** What the storage holds: a save from another tab is not written back. */
	let storedContent = sync.storedContent;
	store.subscribe(({ save }, previous) => {
		const content = serializeSave(save);
		if (save !== previous.save && content !== storedContent) {
			storedContent = content;
			void sync.storage.save(content);
		}
	});
	sync.storage.onExternalSave((content) => {
		const parsed = parseSave(content);
		if (parsed.ok) {
			const save = sync.align(parsed.save);
			storedContent = serializeSave(save);
			store.setState({ save });
		}
	});
}

async function startingStateOf(
	dependencies: ProgressDependencies,
	context: SaveContext,
) {
	const stored = await dependencies.storage.load();
	const loaded = loadedSaveOf(stored, context, dependencies.languages);
	const unreadableCopy = await unreadableCopyOf(
		dependencies.storage,
		loaded.loadIssue ? stored : null,
	);
	return { stored, loaded, unreadableCopy };
}

/**
 * Settings and progress (A5). Every change is saved immediately through
 * the platform storage; changes are rare (end of series, settings).
 */
export async function createProgressStore(
	dependencies: ProgressDependencies,
): Promise<ProgressStore> {
	const contextOf = (): SaveContext => ({
		vocabulary: dependencies.vocabulary,
		appVersion: dependencies.appVersion,
		now: dependencies.now(),
	});
	const starting = await startingStateOf(dependencies, contextOf());
	const { stored, loaded, unreadableCopy } = starting;

	const store = createStore<ProgressState>()((set, get) => ({
		...loaded,
		unreadableCopy,
		applySeriesResult: (series) => {
			const update = saveAfterSeries(get().save, series, contextOf());
			set({ save: update.save });
			return update.result;
		},
		updateSettings: (update) => {
			const { save } = get();
			const settings = update(save.settings);
			set({ save: saveWithSettings(save, settings, dependencies.now()) });
		},
		updateAnkiWords: (update) => {
			const { save } = get();
			const words = update(save.ankiWords);
			set({ save: saveWithAnkiWords(save, words, dependencies.now()) });
		},
		replaceSave: (save) => set({ save: alignedSave(save, contextOf()) }),
		resetProgress: () =>
			set(({ save }) => ({ save: saveAfterReset(save, contextOf()) })),
	}));

	// Saved at once, so that the next launch is not a first one any more.
	if (loaded.isFirstLaunch) {
		void dependencies.storage.save(serializeSave(loaded.save));
	}
	syncWithStorage(store, {
		storage: dependencies.storage,
		storedContent: stored,
		align: (save) => alignedSave(save, contextOf()),
	});
	return store;
}
