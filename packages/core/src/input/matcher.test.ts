import { describe, expect, it } from 'vitest';
import {
	createMatcher,
	feedKey,
	finishWord,
	isWordComplete,
	progressOf,
} from './matcher.ts';
import { rejectionsOf, typeWord } from './test-helpers.ts';

describe('matcher', () => {
	it.each([
		['いぬ', 'inu'],
		['しゃしん', 'shashin'],
		['しゃしん', 'syasin'],
		['きって', 'kitte'],
		['まっちゃ', 'matcha'],
		['まっちゃ', 'maccha'],
		['きんえん', 'kinnenn'],
		['きんえん', "kin'en"],
		['こんにちは', 'konnichiha'],
		['こんにちは', 'konnnichiha'],
		['こんにちは', "kon'nichiha"],
		['コーヒー', 'ko-hi-'],
		['コーヒー', 'koohii'],
		['を', 'o'],
		['ほん', 'hon'],
		['さんぽ', 'sanpo'],
		['ほんや', "hon'ya"],
		['パーティー', 'pa-ti-'],
	])('accepts %s typed as %s', (word, keys) => {
		const outcome = typeWord(word, keys);
		expect(rejectionsOf(outcome)).toEqual([]);
		expect(outcome.isFinished).toBe(true);
	});

	it('ignores the case of the keys', () => {
		expect(typeWord('しゃしん', 'ShaShin').isFinished).toBe(true);
	});

	it('rejects a wrong key without changing the state', () => {
		const state = feedKey(createMatcher('いぬ'), 'i').state;
		const result = feedKey(state, 'x');
		expect(result.state).toBe(state);
		expect(result.events).toEqual([{ kind: 'keyRejected', unitIndex: 1 }]);
	});

	it('blames ん when a single n is followed by a vowel', () => {
		const outcome = typeWord('きんえん', 'kinen');
		expect(rejectionsOf(outcome)[0]).toBe(1);
	});

	it('does not accept the reading of a particle instead of its writing', () => {
		expect(rejectionsOf(typeWord('は', 'wa'))).toEqual([0, 0]);
	});

	it('refuses to type a combination in two parts', () => {
		expect(rejectionsOf(typeWord('きゃ', 'kixya'))).not.toEqual([]);
	});

	it('completes units as soon as their spelling is unambiguous', () => {
		const result = feedKey(feedKey(createMatcher('いぬ'), 'i').state, 'n');
		expect(progressOf(result.state)).toEqual({
			completedUnits: 1,
			typed: 'n',
		});
		expect(result.events).toEqual([]);
	});

	it('waits for space to complete a final ん typed n', () => {
		let state = createMatcher('ほん');
		for (const key of 'hon') {
			state = feedKey(state, key).state;
		}
		expect(isWordComplete(state)).toBe(false);
		const finished = finishWord(state);
		expect(finished && isWordComplete(finished.state)).toBe(true);
		expect(finished?.events).toEqual([
			{ kind: 'unitCompleted', unitIndex: 1 },
		]);
	});

	it('does not finish an incomplete word', () => {
		expect(finishWord(feedKey(createMatcher('いぬ'), 'i').state)).toBe(
			undefined,
		);
	});

	it('rejects keys once the word is complete', () => {
		const outcome = typeWord('い', 'i');
		expect(feedKey(outcome.state, 'a').events[0]?.kind).toBe('keyRejected');
	});
});

describe('matcher with ambiguous keys', () => {
	it('confirms ん only once the keys prove how it was typed', () => {
		const events = typeWord('こんにちは', 'konnichiha').events;
		const completed = events.map((event) => event.unitIndex);
		expect(completed).toEqual([0, 1, 2, 3, 4]);
	});

	it('displays the most advanced reading', () => {
		let state = createMatcher('こんにちは');
		for (const key of 'kon') {
			state = feedKey(state, key).state;
		}
		expect(progressOf(state)).toEqual({ completedUnits: 2, typed: '' });
		state = feedKey(state, 'n').state;
		expect(progressOf(state)).toEqual({ completedUnits: 2, typed: 'n' });
	});

	it('blames ん when the keys contradict every reading', () => {
		expect(rejectionsOf(typeWord('こんにちは', 'konni')).length).toBe(0);
		expect(rejectionsOf(typeWord('こんにちは', 'konnnn'))).toEqual([2]);
	});
});
