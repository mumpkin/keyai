import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { createRandom } from '../random/random.ts';
import { indexVocabulary, type VocabEntry } from '../vocab/entries.ts';
import { wordOf } from '../vocab/test-words.ts';
import type { SelectionContext } from './context.ts';
import { generateSeries } from './generate.ts';

const UNLOCKED = ['い', 'ぬ', 'く', 'に', 'し', 'の', 'か'];

function entriesOf(words: readonly string[]): VocabEntry[] {
	return indexVocabulary(words.map((kana, index) => wordOf(kana, index + 1)));
}

function contextOf(
	words: readonly string[],
	overrides: Partial<SelectionContext> = {},
): SelectionContext {
	return {
		entries: entriesOf(words),
		unlocked: new Set(UNLOCKED),
		featuredKana: undefined,
		weakKana: [],
		...overrides,
	};
}

function kanaOf(series: readonly VocabEntry[]): string[] {
	return series.map((entry) => entry.word.kana);
}

const VOCABULARY = [
	'いぬ',
	'くに',
	'くし',
	'いし',
	'しく',
	'きく',
	'かく',
	'しか',
	'いか',
	'のく',
	'にし',
	'いく',
	'かし',
	'くい',
	'しかく',
	'の',
	'に',
	'か',
	'ねこ',
];

describe('generateSeries', () => {
	it('only uses words whose kana are all unlocked', () => {
		const series = generateSeries(
			contextOf(VOCABULARY),
			10,
			createRandom(1),
		);
		expect(series).toHaveLength(10);
		expect(kanaOf(series)).not.toContain('ねこ');
		expect(kanaOf(series)).not.toContain('きく');
	});

	it('does not repeat a word while unused words remain', () => {
		const series = generateSeries(
			contextOf(VOCABULARY),
			12,
			createRandom(2),
		);
		expect(new Set(kanaOf(series)).size).toBe(12);
	});

	it('repeats words when the vocabulary is too small, never twice in a row', () => {
		const series = kanaOf(
			generateSeries(
				contextOf(['いぬ', 'くに', 'いし']),
				20,
				createRandom(3),
			),
		);
		expect(series).toHaveLength(20);
		for (let index = 1; index < series.length; index += 1) {
			expect(series[index]).not.toBe(series[index - 1]);
		}
	});

	it('features the last unlocked kana in about half of the series', () => {
		const context = contextOf(VOCABULARY, { featuredKana: 'く' });
		const series = generateSeries(context, 10, createRandom(4));
		const featured = series.filter((entry) => entry.kanaSet.has('く'));
		expect(featured.length).toBeGreaterThanOrEqual(5);
	});

	it('covers every weak kana that has a word', () => {
		const context = contextOf(VOCABULARY, { weakKana: ['に', 'の'] });
		const series = kanaOf(generateSeries(context, 5, createRandom(5)));
		expect(series.some((kana) => kana.includes('に'))).toBe(true);
		expect(series.some((kana) => kana.includes('の'))).toBe(true);
	});

	it('caps single-kana words while longer words remain', () => {
		const series = generateSeries(
			contextOf(VOCABULARY),
			10,
			createRandom(6),
		);
		const singles = series.filter((entry) => entry.units.length === 1);
		expect(singles.length).toBeLessThanOrEqual(2);
	});

	it('is deterministic for a given seed', () => {
		const context = contextOf(VOCABULARY, { featuredKana: 'く' });
		expect(kanaOf(generateSeries(context, 8, createRandom(7)))).toEqual(
			kanaOf(generateSeries(context, 8, createRandom(7))),
		);
	});

	it('returns an empty series when no word is eligible', () => {
		const context = contextOf(['ねこ']);
		expect(generateSeries(context, 10, createRandom(8))).toEqual([]);
	});

	it('always returns the requested length without immediate repetition', () => {
		fc.assert(
			fc.property(
				fc.uniqueArray(fc.constantFrom(...VOCABULARY), {
					minLength: 2,
				}),
				fc.integer({ min: 1, max: 60 }),
				fc.integer(),
				(words, length, seed) => {
					const context = contextOf(words, { featuredKana: 'く' });
					const series = kanaOf(
						generateSeries(context, length, createRandom(seed)),
					);
					const eligible = context.entries.filter((entry) =>
						entry.units.every((kana) => context.unlocked.has(kana)),
					);
					fc.pre(eligible.length >= 2);
					expect(series).toHaveLength(length);
					for (let index = 1; index < series.length; index += 1) {
						expect(series[index]).not.toBe(series[index - 1]);
					}
				},
			),
		);
	});
});
