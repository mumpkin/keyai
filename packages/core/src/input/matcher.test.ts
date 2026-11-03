import { describe, expect, it } from 'vitest';
import { createMatcher, feedKey, finishWord } from './matcher.ts';
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
		['こんにちは', 'konnnichiha'],
		['こんにちは', "kon'nichiha"],
		['コーヒー', 'ko-hi-'],
		['コーヒー', 'koohii'],
		['を', 'o'],
		['ほん', 'hon'],
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
		expect(result.state.unitIndex).toBe(1);
		expect(result.state.typed).toBe('n');
	});

	it('waits for space to complete a final ん typed n', () => {
		let state = createMatcher('ほん');
		for (const key of 'hon') {
			state = feedKey(state, key).state;
		}
		expect(state.unitIndex).toBe(1);
		expect(finishWord(state)?.state.unitIndex).toBe(2);
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

describe('matcher with a single n before n', () => {
	it('reads konnichiha as こん + いちは and rejects it', () => {
		expect(rejectionsOf(typeWord('こんにちは', 'konnichiha'))).not.toEqual(
			[],
		);
	});
});
