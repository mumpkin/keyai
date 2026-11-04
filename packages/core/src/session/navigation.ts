import { createMatcher, finishWord, progressOf } from '../input/matcher.ts';
import type { SeriesState, SeriesWord } from './types.ts';
import { applyMatchEvents } from './typing.ts';
import { currentWordOf, withCurrentWord, withWordStatus } from './words.ts';

function moveToNextWord(state: SeriesState, at: number): SeriesState {
	const nextIndex = state.currentIndex + 1;
	if (nextIndex >= state.words.length) {
		return { ...state, phase: 'finished', endedAt: at };
	}
	return {
		...withWordStatus(state, nextIndex, 'current'),
		currentIndex: nextIndex,
		unitStartedAt: at,
		currentWordErrors: 0,
	};
}

/** The skipped unit counts as attempted and faulty, without timing (C3). */
function skipCurrentWord(state: SeriesState, word: SeriesWord): SeriesState {
	const unitIndex = progressOf(word.matcher).completedUnits;
	const skipped = withWordStatus(state, state.currentIndex, 'skipped');
	return {
		...skipped,
		attempts: [
			...state.attempts,
			{
				wordIndex: state.currentIndex,
				kana: word.units[unitIndex] ?? '',
				durationMs: null,
				hadError: true,
				skipped: true,
			},
		],
	};
}

/** Space validates a finished word or skips an unfinished one (A4). */
export function pressSpace(state: SeriesState, at: number): SeriesState {
	const word = currentWordOf(state);
	if (!word) {
		return state;
	}
	const finished = finishWord(word.matcher);
	if (!finished) {
		return moveToNextWord(skipCurrentWord(state, word), at);
	}
	const withEvents = applyMatchEvents(
		withCurrentWord(state, (current) => ({
			...current,
			matcher: finished.state,
		})),
		finished.events,
		at,
	);
	return moveToNextWord(
		withWordStatus(withEvents, state.currentIndex, 'done'),
		at,
	);
}

/**
 * The last word needs no space: the series ends with its last key (C8). A
 * final ん ends the series as soon as `n` spells it.
 */
export function finishLastWord(state: SeriesState, at: number): SeriesState {
	const word = currentWordOf(state);
	const isLastWord = state.currentIndex === state.words.length - 1;
	return isLastWord && word && finishWord(word.matcher)
		? pressSpace(state, at)
		: state;
}

function hasNoInput(word: SeriesWord): boolean {
	const progress = progressOf(word.matcher);
	return progress.completedUnits === 0 && progress.typed === '';
}

/**
 * Backspace at the start of a word returns to the previous word when it was
 * skipped, where it was left; the unit timer restarts (A4).
 */
export function pressBackspace(state: SeriesState, at: number): SeriesState {
	const word = currentWordOf(state);
	const previousIndex = state.currentIndex - 1;
	const previous = state.words[previousIndex];
	if (!(word && hasNoInput(word)) || previous?.status !== 'skipped') {
		return state;
	}
	const reset = withCurrentWord(state, (current) => ({
		...current,
		status: 'pending',
		matcher: createMatcher(current.kana),
	}));
	return {
		...withWordStatus(reset, previousIndex, 'current'),
		currentIndex: previousIndex,
		unitStartedAt: at,
		currentWordErrors: 0,
	};
}
