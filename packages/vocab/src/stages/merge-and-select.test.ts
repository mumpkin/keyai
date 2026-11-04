import { describe, expect, it } from 'vitest';
import { candidate } from '../test-fixtures.ts';
import { MAX_SENSES, mergeHomographs } from './merge.ts';
import { selectWords } from './select.ts';

describe('mergeHomographs', () => {
	it('merges entries spelled alike, the most frequent sense first', () => {
		const [hashi] = mergeHomographs([
			candidate('はし', 4.2, 'edge'),
			candidate('はし', 4.9, 'bridge'),
			candidate('はし', 4.5, 'chopsticks'),
		]);
		expect(hashi?.zipf).toBe(4.9);
		expect(hashi?.senses.map((item) => item.gloss.en)).toEqual([
			'bridge',
			'chopsticks',
			'edge',
		]);
		expect(hashi?.tiedEntries).toBe(1);
	});

	it('flags homographs sharing the same frequency', () => {
		const [iru] = mergeHomographs([
			candidate('いる', 6, 'to be'),
			candidate('いる', 6, 'to need'),
		]);
		expect(iru?.tiedEntries).toBe(2);
	});

	it('keeps a limited number of senses', () => {
		const entries = Array.from({ length: 10 }, (_, index) =>
			candidate('か', 5 - index / 10, `sense ${index}`),
		);
		expect(mergeHomographs(entries)[0]?.senses).toHaveLength(MAX_SENSES);
	});
});

describe('selectWords', () => {
	const words = [
		candidate('いい', 6),
		candidate('いか', 5),
		candidate('くい', 4),
		candidate('くく', 3),
		candidate('ぬい', 2),
		candidate('ぬぬ', 1),
	];

	it('takes the most frequent words', () => {
		const selection = selectWords(words, 2, []);
		expect(selection.words.map((word) => word.kana)).toEqual([
			'いい',
			'いか',
		]);
		expect(selection.coverageAdditions).toBe(0);
	});

	it('adds the most frequent words of under-represented kana', () => {
		const selection = selectWords(words, 2, ['ぬ']);
		expect(selection.words.map((word) => word.kana)).toEqual([
			'いい',
			'いか',
			'ぬい',
			'ぬぬ',
		]);
		expect(selection.coverageAdditions).toBe(2);
	});
});
