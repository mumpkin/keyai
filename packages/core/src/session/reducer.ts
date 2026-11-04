import { finishLastWord, pressBackspace, pressSpace } from './navigation.ts';
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
			return finishLastWord(
				typeKey(started(state, action.at), action.key, action.at),
				action.at,
			);
		case 'space':
			// A space typed out of habit after the last word must not skip
			// the first word of the next series.
			return state.phase === 'ready'
				? state
				: pressSpace(state, action.at);
		case 'backspace':
			return pressBackspace(state, action.at);
	}
}
