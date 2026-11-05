import { finishTypedWord, pressBackspace, pressSpace } from './navigation.ts';
import type { SeriesAction, SeriesState } from './types.ts';
import { typeKey } from './typing.ts';

function isOver(state: SeriesState): boolean {
	return state.phase === 'finished' || state.phase === 'aborted';
}

/** The first key starts the timer; the first unit stays untimed (C3). */
function started(state: SeriesState, at: number): SeriesState {
	return state.phase === 'ready'
		? { ...state, phase: 'typing', startedAt: at }
		: state;
}

/** The next word starts at this space, as it does in the usual mode. */
function spaceOutOfHabit(state: SeriesState, at: number): SeriesState {
	return { ...state, ignoresNextSpace: false, unitStartedAt: at };
}

/**
 * A space typed out of habit after the last word must not skip the first word
 * of the next series, nor one after a word that ended by itself.
 */
function spaceOf(state: SeriesState, at: number): SeriesState {
	if (state.phase === 'ready') {
		return state;
	}
	return state.ignoresNextSpace
		? spaceOutOfHabit(state, at)
		: pressSpace(state, at);
}

function withoutIgnoredSpace(state: SeriesState): SeriesState {
	return { ...state, ignoresNextSpace: false };
}

/** State machine of a series (A4): ready → typing → finished | aborted. */
export function seriesReducer(
	state: SeriesState,
	action: SeriesAction,
): SeriesState {
	if (isOver(state)) {
		return state;
	}
	switch (action.type) {
		case 'abort':
			return { ...state, phase: 'aborted' };
		case 'key':
			return finishTypedWord(
				typeKey(
					started(withoutIgnoredSpace(state), action.at),
					action.key,
					action.at,
				),
				action.at,
			);
		case 'space':
			return spaceOf(state, action.at);
		case 'backspace':
			return pressBackspace(withoutIgnoredSpace(state), action.at);
	}
}
