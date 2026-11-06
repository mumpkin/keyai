import { create } from 'zustand';
import type { QuoteSeries, Series, SeriesSummary } from './series-types.ts';

/** A series left for another screen, taken back on return. */
export type Screen = 'training' | 'statistics' | 'settings';

export type Tour = 'visit' | 'wordCards';

export interface PausedSeries {
	readonly series: Series;
	readonly pausedAt: number;
}

/** Interface state that is not saved (A5): replaces a router. */
export interface UiState {
	readonly screen: Screen;
	readonly lastSeries: SeriesSummary | null;
	readonly navigate: (screen: Screen) => void;
	readonly showSeriesResult: (summary: SeriesSummary) => void;
	/** Forgets the last series and the paused one: the progress changed. */
	readonly clearSeriesResult: () => void;
	readonly pausedSeries: PausedSeries | null;
	readonly pauseSeries: (paused: PausedSeries | null) => void;
	/** The quote left for another screen, finished or not. */
	readonly pausedQuote: QuoteSeries | null;
	readonly pauseQuote: (paused: QuoteSeries | null) => void;
	/** Quotes already drawn, so that none comes back too soon. */
	readonly seenQuotes: ReadonlySet<string>;
	/** The running tour: the visit, or the bubble about word cards. */
	readonly tour: Tour | null;
	readonly startTour: (tour: Tour) => void;
	readonly endTour: () => void;
	/** Grows when the keys must go back to typing, after a dialog or a tour. */
	readonly typingFocusRequests: number;
	readonly requestTypingFocus: () => void;
	readonly markQuoteSeen: (id: string) => void;
	/** Applies the new version that is ready, if there is one. */
	readonly applyUpdate: (() => Promise<void>) | null;
	readonly offerUpdate: (apply: () => Promise<void>) => void;
	readonly dismissUpdate: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
	screen: 'training',
	lastSeries: null,
	navigate: (screen) => set({ screen }),
	showSeriesResult: (lastSeries) => set({ lastSeries }),
	clearSeriesResult: () =>
		set({ lastSeries: null, pausedSeries: null, pausedQuote: null }),
	pausedSeries: null,
	pauseSeries: (pausedSeries) => set({ pausedSeries }),
	pausedQuote: null,
	pauseQuote: (pausedQuote) => set({ pausedQuote }),
	seenQuotes: new Set(),
	tour: null,
	startTour: (tour) => set({ tour }),
	endTour: () =>
		set(({ typingFocusRequests }) => ({
			tour: null,
			typingFocusRequests: typingFocusRequests + 1,
		})),
	typingFocusRequests: 0,
	requestTypingFocus: () =>
		set(({ typingFocusRequests }) => ({
			typingFocusRequests: typingFocusRequests + 1,
		})),
	markQuoteSeen: (id) =>
		set(({ seenQuotes }) => ({ seenQuotes: new Set(seenQuotes).add(id) })),
	applyUpdate: null,
	offerUpdate: (applyUpdate) => set({ applyUpdate }),
	dismissUpdate: () => set({ applyUpdate: null }),
}));
