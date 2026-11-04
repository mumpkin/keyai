import type { SeriesState, WordStatus } from '@keyai/core/session';
import { type KanaSpeed, kanaSpeedsOf, wordSpeedsOf } from '@keyai/core/stats';
import type { VocabEntry } from '@keyai/core/vocab';
import type { SeriesResult } from '@/stores/progress-logic.ts';

export interface SummaryWord {
	readonly position: number;
	readonly entry: VocabEntry;
	readonly status: WordStatus;
	readonly kanaPerMinute: number | null;
}

/** What the statistics show of the last series; it is not saved (A3). */
export interface SeriesSummary extends SeriesResult {
	readonly words: readonly SummaryWord[];
	/** The slowest first. */
	readonly kanaSpeeds: readonly KanaSpeed[];
}

export function seriesSummaryOf(
	result: SeriesResult,
	entries: readonly VocabEntry[],
	series: SeriesState,
): SeriesSummary {
	const speeds = wordSpeedsOf(series.attempts, entries.length);
	return {
		...result,
		kanaSpeeds: kanaSpeedsOf(series.attempts),
		words: entries.map((entry, index) => ({
			position: index + 1,
			entry,
			status: series.words[index]?.status ?? 'done',
			kanaPerMinute: speeds[index] ?? null,
		})),
	};
}
