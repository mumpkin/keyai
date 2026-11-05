import type { SeriesState } from './types.ts';

/**
 * Takes a series back after leaving it: the time away does not count, and the
 * unit in progress can no longer be timed (A4).
 */
export function resumeSeries(state: SeriesState, awayMs: number): SeriesState {
	return state.startedAt === null
		? state
		: {
				...state,
				startedAt: state.startedAt + awayMs,
				unitStartedAt: null,
			};
}
