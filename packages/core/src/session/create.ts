import { createMatcher } from '../input/matcher.ts';
import { tokenize } from '../input/tokenize.ts';
import type { SeriesState, SeriesWord } from './types.ts';

function seriesWordOf(kana: string, index: number): SeriesWord {
	return {
		kana,
		units: tokenize(kana).map((unit) => unit.text),
		status: index === 0 ? 'current' : 'pending',
		matcher: createMatcher(kana),
		faultyUnits: [],
	};
}

/** A series ready to be typed; an empty series is already finished. */
export function createSeries(words: readonly string[]): SeriesState {
	return {
		phase: words.length > 0 ? 'ready' : 'finished',
		words: words.map(seriesWordOf),
		currentIndex: 0,
		startedAt: null,
		endedAt: null,
		unitStartedAt: null,
		attempts: [],
		wrongKeyCount: 0,
	};
}
