import { loadPlatform } from '@/platform/index.ts';
import { createProgressStore } from '@/stores/progress-store.ts';
import { loadVocabulary, type Vocabulary } from '@/vocab/vocabulary.ts';
import type { ProgressStore } from './stores/progress-store.ts';

export interface AppDependencies {
	readonly progressStore: ProgressStore;
	readonly vocabulary: Vocabulary;
}

/** Startup sequence of A5: platform → vocabulary → save. */
export async function bootstrap(): Promise<AppDependencies> {
	const [platform, vocabulary] = await Promise.all([
		loadPlatform(),
		loadVocabulary(),
	]);
	const progressStore = await createProgressStore({
		storage: platform.storage,
		vocabulary,
		appVersion: __APP_VERSION__,
		languages: navigator.languages,
		now: () => new Date(),
	});
	return { progressStore, vocabulary };
}
