import type { SaveError, SaveFile } from '@keyai/core/save';
import { serializeSave } from '@keyai/core/save';
import type { Settings } from '@keyai/core/settings';
import type { SeriesRecord } from '@keyai/core/stats';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { SaveStorage } from '@/platform/index.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import {
	freshSave,
	loadedSaveOf,
	type SaveContext,
	type SeriesResult,
	saveAfterSeries,
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
	readonly applySeriesResult: (
		record: SeriesRecord,
		wordCount: number,
	) => SeriesResult;
	readonly updateSettings: (update: (settings: Settings) => Settings) => void;
	readonly replaceSave: (save: SaveFile) => void;
	readonly resetProgress: () => void;
}

export type ProgressStore = StoreApi<ProgressState>;

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
	const stored = await dependencies.storage.load();
	const loaded = loadedSaveOf(stored, contextOf(), dependencies.languages);

	const store = createStore<ProgressState>()((set, get) => ({
		...loaded,
		applySeriesResult: (record, wordCount) => {
			const update = saveAfterSeries(
				get().save,
				{ record, wordCount },
				contextOf(),
			);
			set({ save: update.save });
			return update.result;
		},
		updateSettings: (update) =>
			set(({ save }) => ({
				save: saveWithSettings(
					save,
					update(save.settings),
					dependencies.now(),
				),
			})),
		replaceSave: (save) => set({ save }),
		resetProgress: () =>
			set({ save: freshSave(contextOf(), dependencies.languages) }),
	}));

	store.subscribe((state, previous) => {
		if (state.save !== previous.save) {
			void dependencies.storage.save(serializeSave(state.save));
		}
	});
	return store;
}
