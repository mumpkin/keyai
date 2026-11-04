import { initTranslations } from '@/i18n/index.ts';
import {
	loadPlatform,
	type Platform,
	type WindowControls,
} from '@/platform/index.ts';
import { createProgressStore } from '@/stores/progress-store.ts';
import { useUiStore } from '@/stores/ui-store.ts';
import { loadVocabulary, type Vocabulary } from '@/vocab/vocabulary.ts';
import type { ProgressStore } from './stores/progress-store.ts';

export interface AppDependencies {
	readonly progressStore: ProgressStore;
	readonly vocabulary: Vocabulary;
	readonly startsWithSplash: boolean;
	readonly windowControls: WindowControls | null;
	readonly exportFile: Platform['exportFile'];
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
	platform.watchForUpdate(useUiStore.getState().offerUpdate);
	const { isFirstLaunch } = progressStore.getState();
	return {
		progressStore,
		vocabulary,
		startsWithSplash: platform.playsSplashOnEveryLaunch || isFirstLaunch,
		windowControls: platform.windowControls,
		exportFile: platform.exportFile,
	};
}
