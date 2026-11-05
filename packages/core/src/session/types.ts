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
	/** Words follow each other without a space, typed or displayed (C8). */
	readonly naturalWriting: boolean;
	/** A word just ended by itself: a space out of habit must skip nothing. */
	readonly ignoresNextSpace: boolean;
	readonly words: readonly SeriesWord[];
	readonly currentIndex: number;
	/** Time of the first key, in milliseconds. */
	readonly startedAt: number | null;
	readonly endedAt: number | null;
	/** Start of the unit being typed; `null` until it can be timed. */
	readonly unitStartedAt: number | null;
	readonly attempts: readonly UnitAttempt[];
	readonly wrongKeyCount: number;
	/** Wrong keys on the current word; drives the error feedback (A4). */
	readonly currentWordErrors: number;
}

/** Keys and events coming from the interface, timestamped by the caller. */
export type SeriesAction =
	| { readonly type: 'key'; readonly key: string; readonly at: number }
	| { readonly type: 'space'; readonly at: number }
	| { readonly type: 'backspace'; readonly at: number }
	| { readonly type: 'abort' };
