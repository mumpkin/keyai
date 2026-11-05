import { describe, expect, it } from 'vitest';
import type { Progress } from '../progression/schema.ts';
import { entryOf } from '../vocab/entries.ts';
import { selectionContextOf } from './context.ts';

const FAST = { ms: 1000, error: false };
const RULES = { thresholdKanaPerMinute: 30 };

describe('selectionContextOf', () => {
	it('features the weakest kana and lists weak kana, weakest first', () => {
		const progress: Progress = {
			unlocked: ['い', 'の', 'に', 'く'],
			kana: Object.fromEntries([
				['い', { seen: 5, errors: 0, recent: Array(5).fill(FAST) }],
				[
					'の',
					{
						seen: 2,
						errors: 0,
						recent: [{ ms: 4000, error: false }],
					},
				],
				[
					'に',
					{
						seen: 2,
						errors: 0,
						recent: [{ ms: 2500, error: false }],
					},
				],
			]),
		};
		const context = selectionContextOf([], progress, RULES);
		expect(context.featuredKana).toBe('く');
		expect(context.weakKana).toEqual(['く', 'の', 'に']);
		expect(context.unlocked.has('い')).toBe(true);
	});

	it('features the last unlocked kana once everything is mastered', () => {
		const stats = { seen: 5, errors: 0, recent: Array(5).fill(FAST) };
		const progress: Progress = {
			unlocked: ['い', 'の'],
			kana: Object.fromEntries([
				['い', stats],
				['の', stats],
			]),
		};
		expect(selectionContextOf([], progress, RULES).featuredKana).toBe('の');
	});

	it('keeps only the words and kana of one script', () => {
		const words = ['いぬ', 'マン'].flatMap(
			(kana) =>
				entryOf({
					id: kana,
					kana,
					rank: 1,
					senses: [{ gloss: { en: kana }, pos: ['noun'] }],
				}) ?? [],
		);
		const progress: Progress = {
			unlocked: ['い', 'ぬ', 'マ', 'ン'],
			kana: {},
		};
		const context = selectionContextOf(words, progress, {
			...RULES,
			script: 'katakana',
		});
		expect(context.entries.map((entry) => entry.word.kana)).toEqual([
			'マン',
		]);
		expect(context.weakKana).toEqual(['マ', 'ン']);
		expect(context.featuredKana).toBe('マ');
	});

	it('falls back on every word when a script has none', () => {
		const words =
			entryOf({
				id: 'いぬ',
				kana: 'いぬ',
				rank: 1,
				senses: [{ gloss: { en: 'dog' }, pos: ['noun'] }],
			}) ?? [];
		const progress: Progress = { unlocked: ['い', 'ぬ'], kana: {} };
		const context = selectionContextOf([words].flat(), progress, {
			...RULES,
			script: 'katakana',
		});
		expect(context.entries).toHaveLength(1);
	});
});
