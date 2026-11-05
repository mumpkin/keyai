import { initTranslations } from '@/i18n/index.ts';
import {
	loadPlatform,
	type Platform,
	type WindowControls,
} from '@/platform/index.ts';
import type { ProgressStore } from '@/stores/progress-store.ts';
import { createProgressStore } from '@/stores/progress-store.ts';
import { useUiStore } from '@/stores/ui-store.ts';
import { loadQuoteCards, loadQuotes, type QuoteEntry } from '@/vocab/quotes.ts';
import {
	loadVocabulary,
	type Vocabulary,
	withCards,
} from '@/vocab/vocabulary.ts';

export interface AppDependencies {
	readonly progressStore: ProgressStore;
	readonly vocabulary: Vocabulary;
	readonly quotes: readonly QuoteEntry[];
	readonly startsWithSplash: boolean;
	readonly windowControls: WindowControls | null;
	readonly exportFile: Platform['exportFile'];
	readonly openLink: Platform['openLink'];
}

/** Startup sequence of A5: platform → vocabulary → save → translations. */
export async function bootstrap(): Promise<AppDependencies> {
	const [platform, words, quotes, cards] = await Promise.all([
		loadPlatform(),
		loadVocabulary(),
		loadQuotes(),
		loadQuoteCards(),
	]);
	const vocabulary = withCards(words, cards);
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
		quotes,
		startsWithSplash: platform.playsSplashOnEveryLaunch || isFirstLaunch,
		windowControls: platform.windowControls,
		exportFile: platform.exportFile,
		openLink: platform.openLink,
	};
}
