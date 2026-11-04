import { createSeries } from './create.ts';
import { seriesReducer } from './reducer.ts';
import type { SeriesAction, SeriesState } from './types.ts';

export const KEY_INTERVAL_MS = 500;
const SPACE = ' ';
const BACKSPACE = '<';

function actionOf(character: string, at: number): SeriesAction {
	if (character === SPACE) {
		return { type: 'space', at };
	}
	if (character === BACKSPACE) {
		return { type: 'backspace', at };
	}
	return { type: 'key', key: character, at };
}

/**
 * Plays a script on a series, one action every 500 ms starting at 0:
 * letters are keys, ' ' is space and '<' is backspace.
 */
export function play(words: readonly string[], script: string): SeriesState {
	return [...script].reduce(
		(state, character, index) =>
			seriesReducer(state, actionOf(character, index * KEY_INTERVAL_MS)),
		createSeries(words),
	);
}
