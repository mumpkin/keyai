import type { SeriesState, SeriesWord } from './types.ts';

export function currentWordOf(state: SeriesState): SeriesWord | undefined {
	return state.words[state.currentIndex];
}

export function withCurrentWord(
	state: SeriesState,
	update: (word: SeriesWord) => SeriesWord,
): SeriesState {
	return {
		...state,
		words: state.words.map((word, index) =>
			index === state.currentIndex ? update(word) : word,
		),
	};
}

export function withWordStatus(
	state: SeriesState,
	index: number,
	status: SeriesWord['status'],
): SeriesState {
	return {
		...state,
		words: state.words.map((word, wordIndex) =>
			wordIndex === index ? { ...word, status } : word,
		),
	};
}
