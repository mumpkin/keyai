import type { MatcherState } from '../input/matcher.ts';
import type { UnitAttempt } from '../stats/types.ts';

export type WordStatus = 'pending' | 'current' | 'done' | 'skipped';

export interface SeriesWord {
	readonly kana: string;
	/** Kana texts of the word's units. */
	readonly units: readonly string[];
	readonly status: WordStatus;
	readonly matcher: MatcherState;
	/** Units on which a wrong key was typed; shown in red (C8). */
	readonly faultyUnits: readonly number[];
}

export type SeriesPhase = 'ready' | 'typing' | 'finished' | 'aborted';

export interface SeriesState {
	readonly phase: SeriesPhase;
	readonly words: readonly SeriesWord[];
	readonly currentIndex: number;
	/** Time of the first key, in milliseconds. */
	readonly startedAt: number | null;
	readonly endedAt: number | null;
	/** Start of the unit being typed; `null` until it can be timed. */
	readonly unitStartedAt: number | null;
	readonly attempts: readonly UnitAttempt[];
	readonly wrongKeyCount: number;
}

/** Keys and events coming from the interface, timestamped by the caller. */
export type SeriesAction =
	| { readonly type: 'key'; readonly key: string; readonly at: number }
	| { readonly type: 'space'; readonly at: number }
	| { readonly type: 'backspace'; readonly at: number }
	| { readonly type: 'abort' };
