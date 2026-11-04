import type { SeriesRecord } from '../stats/types.ts';
import type { SeriesState } from './types.ts';

/** What a finished series hands to statistics and progression. */
export function seriesRecordOf(state: SeriesState): SeriesRecord {
	const elapsedMs =
		state.startedAt !== null && state.endedAt !== null
			? state.endedAt - state.startedAt
			: 0;
	return {
		attempts: state.attempts,
		wrongKeyCount: state.wrongKeyCount,
		elapsedMs,
	};
}
