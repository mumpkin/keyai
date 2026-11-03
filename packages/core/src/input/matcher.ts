import { spellingsOf } from './spellings.ts';
import { tokenize } from './tokenize.ts';

/** One possible reading of the keys typed so far. */
interface Hypothesis {
	/** Index of the unit being typed; equals the unit count once done. */
	readonly unitIndex: number;
	/** Keys typed so far for that unit. */
	readonly typed: string;
}

/**
 * Keys can be read in several ways while they remain ambiguous ('konn' may
 * be こん + n… or こ + nn…): the matcher follows every reading still
 * possible and drops those the next keys contradict.
 */
export interface MatcherState {
	/** Accepted spellings of each unit of the word. */
	readonly spellings: readonly (readonly string[])[];
	readonly hypotheses: readonly Hypothesis[];
}

export type MatchEvent =
	| { readonly kind: 'unitCompleted'; readonly unitIndex: number }
	| { readonly kind: 'keyRejected'; readonly unitIndex: number };

export interface MatchResult {
	readonly state: MatcherState;
	readonly events: readonly MatchEvent[];
}

/** Progress to display: the most advanced reading. */
export interface MatcherProgress {
	readonly completedUnits: number;
	readonly typed: string;
}

export function createMatcher(word: string): MatcherState {
	return {
		spellings: spellingsOf(tokenize(word)),
		hypotheses: [{ unitIndex: 0, typed: '' }],
	};
}

/** Units completed in every reading still possible. */
function confirmedUnits(state: MatcherState): number {
	return Math.min(...state.hypotheses.map(({ unitIndex }) => unitIndex));
}

export function isWordComplete(state: MatcherState): boolean {
	return confirmedUnits(state) >= state.spellings.length;
}

function isMoreAdvanced(candidate: Hypothesis, best: Hypothesis): boolean {
	if (candidate.unitIndex !== best.unitIndex) {
		return candidate.unitIndex > best.unitIndex;
	}
	return candidate.typed.length > best.typed.length;
}

export function progressOf(state: MatcherState): MatcherProgress {
	const mostAdvanced = state.hypotheses.reduce((best, candidate) =>
		isMoreAdvanced(candidate, best) ? candidate : best,
	);
	return {
		completedUnits: mostAdvanced.unitIndex,
		typed: mostAdvanced.typed,
	};
}

function successorsOf(
	spellings: MatcherState['spellings'],
	hypothesis: Hypothesis,
	key: string,
): Hypothesis[] {
	const typed = hypothesis.typed + key;
	const candidates = (spellings[hypothesis.unitIndex] ?? []).filter(
		(spelling) => spelling.startsWith(typed),
	);
	const completes = candidates.includes(typed);
	const continues = candidates.some((spelling) => spelling !== typed);
	return [
		...(completes
			? [{ unitIndex: hypothesis.unitIndex + 1, typed: '' }]
			: []),
		...(continues ? [{ unitIndex: hypothesis.unitIndex, typed }] : []),
	];
}

function deduplicated(hypotheses: readonly Hypothesis[]): Hypothesis[] {
	const byKey = new Map(
		hypotheses.map((hypothesis) => [
			`${hypothesis.unitIndex}:${hypothesis.typed}`,
			hypothesis,
		]),
	);
	return [...byKey.values()];
}

function completionEvents(from: number, to: number): MatchEvent[] {
	return Array.from({ length: to - from }, (_, offset) => ({
		kind: 'unitCompleted' as const,
		unitIndex: from + offset,
	}));
}

function moveTo(
	state: MatcherState,
	hypotheses: readonly Hypothesis[],
): MatchResult {
	const next = { ...state, hypotheses };
	return {
		state: next,
		events: completionEvents(confirmedUnits(state), confirmedUnits(next)),
	};
}

/**
 * Feeds one key. A key that no reading accepts is rejected, blamed on the
 * unit the user has reached, and leaves the state unchanged.
 */
export function feedKey(state: MatcherState, key: string): MatchResult {
	const lowerKey = key.toLowerCase();
	const hypotheses = deduplicated(
		state.hypotheses.flatMap((hypothesis) =>
			successorsOf(state.spellings, hypothesis, lowerKey),
		),
	);
	if (hypotheses.length === 0) {
		const blamedUnit = progressOf(state).completedUnits;
		return {
			state,
			events: [{ kind: 'keyRejected', unitIndex: blamedUnit }],
		};
	}
	return moveTo(state, hypotheses);
}

/**
 * Ends the word on space, choosing a reading that completes the word
 * ('ほん' typed 'hon'). Returns `undefined` when no reading is complete.
 */
export function finishWord(state: MatcherState): MatchResult | undefined {
	const unitCount = state.spellings.length;
	const complete = state.hypotheses.filter(
		({ unitIndex }) => unitIndex >= unitCount,
	);
	return complete.length > 0 ? moveTo(state, complete) : undefined;
}
