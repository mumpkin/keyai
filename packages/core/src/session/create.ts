import { createMatcher } from '../input/matcher.ts';
import { tokenize } from '../input/tokenize.ts';
import type { SeriesState, SeriesWord, WordTyping } from './types.ts';

function seriesWordOf(
	kana: string,
	index: number,
	typing: WordTyping = {},
): SeriesWord {
	return {
		kana,
		units: typing.keys ? [kana] : tokenize(kana).map((unit) => unit.text),
		status: index === 0 ? 'current' : 'pending',
		matcher: createMatcher(kana, typing),
		typing,
		faultyUnits: [],
	};
}

export interface SeriesOptions {
	readonly naturalWriting?: boolean;
	/** How each word is typed, in a quote. */
	readonly typing?: readonly WordTyping[];
}

/** A series ready to be typed; an empty series is already finished. */
export function createSeries(
	words: readonly string[],
	{ naturalWriting = false, typing = [] }: SeriesOptions = {},
): SeriesState {
	return {
		phase: words.length > 0 ? 'ready' : 'finished',
		naturalWriting,
		ignoresNextSpace: false,
		words: words.map((word, index) =>
			seriesWordOf(word, index, typing[index]),
		),
		currentIndex: 0,
		startedAt: null,
		endedAt: null,
		unitStartedAt: null,
		attempts: [],
		wrongKeyCount: 0,
		currentWordErrors: 0,
	};
}
