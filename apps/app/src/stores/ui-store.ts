import { create } from 'zustand';
import type { Screen } from '@/features/layout/screen.ts';
import type { SeriesSummary } from '@/features/statistics/series-summary.ts';
import type { Series } from '@/features/training/series-view.ts';

/** A series left for another screen, taken back on return. */
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
	/** Applies the new version that is ready, if there is one. */
	readonly applyUpdate: (() => void) | null;
	readonly offerUpdate: (apply: () => void) => void;
	readonly dismissUpdate: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
	screen: 'training',
	lastSeries: null,
	navigate: (screen) => set({ screen }),
	showSeriesResult: (lastSeries) => set({ lastSeries }),
	clearSeriesResult: () => set({ lastSeries: null, pausedSeries: null }),
	pausedSeries: null,
	pauseSeries: (pausedSeries) => set({ pausedSeries }),
	applyUpdate: null,
	offerUpdate: (applyUpdate) => set({ applyUpdate }),
	dismissUpdate: () => set({ applyUpdate: null }),
}));
