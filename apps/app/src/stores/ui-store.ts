import { create } from 'zustand';
import type { Screen } from '@/features/layout/screen.ts';
import type { SeriesSummary } from '@/features/statistics/series-summary.ts';

/** Interface state that is not saved (A5): replaces a router. */
export interface UiState {
	readonly screen: Screen;
	readonly lastSeries: SeriesSummary | null;
	readonly navigate: (screen: Screen) => void;
	readonly showSeriesResult: (summary: SeriesSummary) => void;
	readonly clearSeriesResult: () => void;
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
	clearSeriesResult: () => set({ lastSeries: null }),
	applyUpdate: null,
	offerUpdate: (applyUpdate) => set({ applyUpdate }),
	dismissUpdate: () => set({ applyUpdate: null }),
}));
