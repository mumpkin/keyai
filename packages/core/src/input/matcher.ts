import { spellingsOf } from './spellings.ts';
import { tokenize } from './tokenize.ts';

export interface MatcherState {
	/** Accepted spellings of each unit of the word. */
	readonly spellings: readonly (readonly string[])[];
	/** Index of the unit being typed; equals the unit count once done. */
	readonly unitIndex: number;
	/** Keys typed so far for the current unit. */
	readonly typed: string;
}

export type MatchEvent =
	| { readonly kind: 'unitCompleted'; readonly unitIndex: number }
	| { readonly kind: 'keyRejected'; readonly unitIndex: number };

export interface MatchResult {
	readonly state: MatcherState;
	readonly events: readonly MatchEvent[];
}

export function createMatcher(word: string): MatcherState {
	return { spellings: spellingsOf(tokenize(word)), unitIndex: 0, typed: '' };
}

export function isWordComplete(state: MatcherState): boolean {
	return state.unitIndex >= state.spellings.length;
}

function currentSpellings(state: MatcherState): readonly string[] {
	return state.spellings[state.unitIndex] ?? [];
}

function isExactSpelling(state: MatcherState): boolean {
	return currentSpellings(state).includes(state.typed);
}

function completeUnit(state: MatcherState): MatchResult {
	return {
		state: { ...state, unitIndex: state.unitIndex + 1, typed: '' },
		events: [{ kind: 'unitCompleted', unitIndex: state.unitIndex }],
	};
}

function reject(state: MatcherState): MatchResult {
	return {
		state,
		events: [{ kind: 'keyRejected', unitIndex: state.unitIndex }],
	};
}

function advance(state: MatcherState, typed: string): MatchResult {
	const candidates = currentSpellings(state).filter((spelling) =>
		spelling.startsWith(typed),
	);
	const isUnambiguous = candidates.every((spelling) => spelling === typed);
	const next = { ...state, typed };
	return isUnambiguous ? completeUnit(next) : { state: next, events: [] };
}

function chain(first: MatchResult, second: MatchResult): MatchResult {
	return {
		state: second.state,
		events: [...first.events, ...second.events],
	};
}

/**
 * Feeds one key. A wrong key is rejected and leaves the state unchanged.
 * When the keys typed so far already spell the unit but a longer spelling
 * exists ('n' or 'nn' for ん), the unit completes only once the next key
 * proves the short spelling was meant.
 */
export function feedKey(state: MatcherState, key: string): MatchResult {
	if (isWordComplete(state)) {
		return reject(state);
	}
	const typed = state.typed + key.toLowerCase();
	const extendsSomeSpelling = currentSpellings(state).some((spelling) =>
		spelling.startsWith(typed),
	);
	if (extendsSomeSpelling) {
		return advance(state, typed);
	}
	if (isExactSpelling(state)) {
		const completed = completeUnit(state);
		return chain(completed, feedKey(completed.state, key));
	}
	return reject(state);
}

/**
 * Ends the word on space: completes a last unit left pending by an
 * ambiguous spelling ('ほん' typed 'hon'). Returns `undefined` when the word
 * is not finished.
 */
export function finishWord(state: MatcherState): MatchResult | undefined {
	if (isWordComplete(state)) {
		return { state, events: [] };
	}
	const isLastUnit = state.unitIndex === state.spellings.length - 1;
	return isLastUnit && isExactSpelling(state)
		? completeUnit(state)
		: undefined;
}
