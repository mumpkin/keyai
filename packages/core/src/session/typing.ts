import { feedKey, type MatchEvent } from '../input/matcher.ts';
import type { UnitAttempt } from '../stats/types.ts';
import type { SeriesState, SeriesWord } from './types.ts';
import { currentWordOf, withCurrentWord } from './words.ts';

function attemptOf(
	word: SeriesWord,
	unitIndex: number,
	timing: { readonly at: number; readonly unitStartedAt: number | null },
): UnitAttempt {
	return {
		kana: word.units[unitIndex] ?? '',
		durationMs:
			timing.unitStartedAt === null
				? null
				: timing.at - timing.unitStartedAt,
		hadError: word.faultyUnits.includes(unitIndex),
		skipped: false,
	};
}

function applyEvent(
	state: SeriesState,
	event: MatchEvent,
	at: number,
): SeriesState {
	if (event.kind === 'keyRejected') {
		const faulty = withCurrentWord(state, (current) => ({
			...current,
			faultyUnits: [
				...new Set([...current.faultyUnits, event.unitIndex]),
			],
		}));
		return {
			...faulty,
			wrongKeyCount: state.wrongKeyCount + 1,
			currentWordErrors: state.currentWordErrors + 1,
		};
	}
	const word = currentWordOf(state) as SeriesWord;
	return {
		...state,
		attempts: [
			...state.attempts,
			attemptOf(word, event.unitIndex, {
				at,
				unitStartedAt: state.unitStartedAt,
			}),
		],
		unitStartedAt: at,
	};
}

/** Applies the events of a matcher step to the series. */
export function applyMatchEvents(
	state: SeriesState,
	events: readonly MatchEvent[],
	at: number,
): SeriesState {
	return events.reduce(
		(current, event) => applyEvent(current, event, at),
		state,
	);
}

/** A romaji key on the current word (A4). */
export function typeKey(state: SeriesState, key: string, at: number) {
	const word = currentWordOf(state);
	if (!word) {
		return state;
	}
	const result = feedKey(word.matcher, key);
	const advanced = withCurrentWord(state, (current) => ({
		...current,
		matcher: result.state,
	}));
	return applyMatchEvents(advanced, result.events, at);
}
