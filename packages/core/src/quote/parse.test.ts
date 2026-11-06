import { describe, expect, it } from 'vitest';
import { createSeries } from '../session/create.ts';
import { seriesReducer } from '../session/reducer.ts';
import {
	quoteInKana,
	quoteKanaCountOf,
	quoteSeriesOf,
	quoteTokensOf,
	quoteWordsOf,
	withTypedMarks,
} from './parse.ts';

const RUBY = '[人生|じんせい] {は} [扱|あつか]う 。';

function played(ruby: string, keys: string) {
	const tokens = quoteTokensOf(ruby);
	const { words, typing } = quoteSeriesOf(tokens);
	return [...keys].reduce(
		(state, key, index) =>
			seriesReducer(state, { type: 'key', key, at: index }),
		createSeries(words, { naturalWriting: true, typing }),
	);
}

describe('quoteTokensOf', () => {
	it('tells words from punctuation', () => {
		expect(quoteTokensOf(RUBY).map((token) => token.kind)).toEqual([
			'word',
			'word',
			'word',
			'mark',
		]);
	});

	it('splits kanji and kana', () => {
		const [, , word] = quoteTokensOf(RUBY);
		expect(word).toMatchObject({
			pieces: [{ text: '扱', reading: 'あつか' }, { text: 'う' }],
			reading: 'あつかう',
			isParticle: false,
		});
	});

	it('marks particles', () => {
		expect(quoteTokensOf(RUBY)[1]).toMatchObject({
			pieces: [{ text: 'は' }],
			isParticle: true,
		});
	});

	it('gives each word its card, skipping the marks', () => {
		const tokens = quoteTokensOf('[犬|いぬ] 、 ねこ', ['dog', null]);
		expect(quoteWordsOf(tokens).map((word) => word.cardId)).toEqual([
			'dog',
			undefined,
		]);
	});

	it('counts the kana to type', () => {
		const tokens = quoteTokensOf(RUBY);
		expect(quoteWordsOf(tokens)).toHaveLength(3);
		expect(quoteKanaCountOf(tokens)).toBe(9);
	});
});

describe('typing a quote', () => {
	it('skips punctuation', () => {
		expect(played('[犬|いぬ] 。 [猫|ねこ]', 'inuneko').phase).toBe(
			'finished',
		);
	});

	it('accepts the written and the spoken particle', () => {
		expect(played('{は} [猫|ねこ]', 'haneko').phase).toBe('finished');
		expect(played('{は} [猫|ねこ]', 'waneko').phase).toBe('finished');
		expect(played('{へ} [猫|ねこ]', 'eneko').phase).toBe('finished');
	});

	it('refuses the spoken reading of a word that is no particle', () => {
		expect(played('は [猫|ねこ]', 'wa').wrongKeyCount).toBe(2);
	});

	it('doubles a consonant across two words', () => {
		const state = played('[似|に] て なっ て いる', 'nitenatteiru');
		expect(state.phase).toBe('finished');
		expect(state.wrongKeyCount).toBe(0);
	});
});

describe('quoteInKana', () => {
	it('shows the reading of the kanji', () => {
		const [word] = quoteInKana(quoteTokensOf('[犬|いぬ]'));
		expect(word).toMatchObject({ pieces: [{ text: 'いぬ' }] });
	});
});

describe('withTypedMarks', () => {
	function playedWithMarks(keys: string) {
		const tokens = withTypedMarks(quoteTokensOf('[犬|いぬ] 、 ねこ 。'));
		const { words, typing } = quoteSeriesOf(tokens);
		return [...keys].reduce(
			(state, key, index) =>
				seriesReducer(state, { type: 'key', key, at: index }),
			createSeries(words, { naturalWriting: true, typing }),
		);
	}

	it('waits for the key of each mark', () => {
		const state = playedWithMarks('inu,neko.');
		expect(state.phase).toBe('finished');
		expect(state.wrongKeyCount).toBe(0);
	});

	it('refuses a word typed over a mark', () => {
		expect(playedWithMarks('inun').wrongKeyCount).toBe(1);
	});
});
