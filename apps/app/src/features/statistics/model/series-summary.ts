import type { SeriesState } from '@keyai/core/session';
import { kanaSpeedsOf, wordSpeedsOf } from '@keyai/core/stats';
import type { VocabEntry } from '@keyai/core/vocab';
import type { SeriesResult } from '@/stores/progress-logic.ts';
import type { SeriesSummary } from '@/stores/series-types.ts';

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
