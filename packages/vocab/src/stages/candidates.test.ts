import { describe, expect, it } from 'vitest';
import type { JmdictWord } from '../io/jmdict.ts';
import { jmdictWord, sense } from '../test-fixtures.ts';
import { candidateOf, unitsOf } from './candidates.ts';

const ZIPF = new Map([
	['犬', 5.1],
	['いぬ', 3.5],
	['い', 6.9],
	['ねこ', 4.8],
]);

describe('candidateOf', () => {
	it('looks up the usual kanji form of a word written in kanji', () => {
		expect(
			candidateOf(jmdictWord('いぬ', [sense('dog')], '犬'), ZIPF)?.zipf,
		).toBe(5.1);
	});

	it('looks up the kana of a word usually written in kana', () => {
		const word = jmdictWord('ねこ', [sense('cat', { misc: ['uk'] })], '猫');
		expect(candidateOf(word, ZIPF)?.zipf).toBe(4.8);
	});

	it('does not trust the frequency of an uncommon form', () => {
		const rush: JmdictWord = {
			...jmdictWord('い', [sense('soft rush', { misc: ['uk'] })], '藺'),
			kana: [{ text: 'い', common: false, tags: [] }],
		};
		expect(candidateOf(rush, ZIPF)).toBeUndefined();
	});

	it('drops words without frequency, without kept sense or affixes only', () => {
		expect(
			candidateOf(jmdictWord('とら', [sense('tiger')]), ZIPF),
		).toBeUndefined();
		expect(
			candidateOf(
				jmdictWord('いぬ', [sense('dog', { misc: ['arch'] })], '犬'),
				ZIPF,
			),
		).toBeUndefined();
		expect(
			candidateOf(
				jmdictWord(
					'いぬ',
					[sense('-dog', { partOfSpeech: ['suf'] })],
					'犬',
				),
				ZIPF,
			),
		).toBeUndefined();
	});

	it('only keeps typeable words of eight units at most', () => {
		expect(unitsOf('きゃく')).toEqual(['きゃ', 'く']);
		expect(unitsOf('あっ')).toBeUndefined();
		expect(unitsOf('ゐ')).toBeUndefined();
		expect(unitsOf('あいうえおかきくけ')).toBeUndefined();
	});
});
