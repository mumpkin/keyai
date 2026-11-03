import {
	createMatcher,
	feedKey,
	finishWord,
	type MatchEvent,
	type MatcherState,
} from './matcher.ts';

export interface TypingOutcome {
	readonly state: MatcherState;
	readonly events: readonly MatchEvent[];
	readonly isFinished: boolean;
}

/** Types every key of `keys`, then presses space. */
export function typeWord(word: string, keys: string): TypingOutcome {
	let state = createMatcher(word);
	const events: MatchEvent[] = [];
	for (const key of keys) {
		const result = feedKey(state, key);
		state = result.state;
		events.push(...result.events);
	}
	const finished = finishWord(state);
	return {
		state: finished?.state ?? state,
		events: [...events, ...(finished?.events ?? [])],
		isFinished: finished !== undefined,
	};
}

export function rejectionsOf(outcome: TypingOutcome): number[] {
	return outcome.events
		.filter((event) => event.kind === 'keyRejected')
		.map((event) => event.unitIndex);
}
