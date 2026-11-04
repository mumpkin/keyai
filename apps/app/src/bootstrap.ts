import { initTranslations } from '@/i18n/index.ts';
import { loadPlatform } from '@/platform/index.ts';
import { createProgressStore } from '@/stores/progress-store.ts';
import { loadVocabulary, type Vocabulary } from '@/vocab/vocabulary.ts';
import type { ProgressStore } from './stores/progress-store.ts';

export interface AppDependencies {
	readonly progressStore: ProgressStore;
	readonly vocabulary: Vocabulary;
	readonly startsWithSplash: boolean;
}

/** Startup sequence of A5: platform → vocabulary → save → translations. */
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
	await initTranslations(progressStore.getState().save.settings.locale);
	const { isFirstLaunch } = progressStore.getState();
	return {
		progressStore,
		vocabulary,
		startsWithSplash: platform.playsSplashOnEveryLaunch || isFirstLaunch,
	};
}
