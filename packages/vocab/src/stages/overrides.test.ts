import type { VocabWord } from '@keyai/core/vocab';
import { describe, expect, it } from 'vitest';
import { applyOverrides, FRENCH_REVIEW_RANK } from './overrides.ts';

function word(kana: string, rank: number, fr?: string): VocabWord {
	return {
		id: kana,
		kana,
		rank,
		senses: [
			{ gloss: { en: 'to do', ...(fr ? { fr } : {}) }, pos: ['verb'] },
			{ gloss: { en: 'to cost' }, pos: ['verb'] },
		],
	};
}

const FREQUENT = FRENCH_REVIEW_RANK;
const RARE = FRENCH_REVIEW_RANK + 1;

describe('applyOverrides', () => {
	it('drops the French of a frequent word without a review', () => {
		const [frequent] = applyOverrides(
			[word('する', FREQUENT, 'coûter')],
			[],
		);
		expect(frequent?.senses[0]?.gloss).toEqual({ en: 'to do' });
	});

	it('keeps the French of a rarer word', () => {
		const [rare] = applyOverrides([word('かべ', RARE, 'mur')], []);
		expect(rare?.senses[0]?.gloss.fr).toBe('mur');
	});

	it('applies a reviewed translation', () => {
		const [frequent] = applyOverrides(
			[word('する', FREQUENT, 'coûter')],
			[{ kana: 'する', fr: 'faire', reviewed: true }],
		);
		expect(frequent?.senses[0]?.gloss.fr).toBe('faire');
	});

	it('leaves a draft out of the vocabulary', () => {
		const [frequent] = applyOverrides(
			[word('する', FREQUENT)],
			[{ kana: 'する', fr: 'faire', reviewed: false }],
		);
		expect(frequent?.senses[0]?.gloss.fr).toBeUndefined();
	});

	it('puts another sense first', () => {
		const [frequent] = applyOverrides(
			[word('する', FREQUENT)],
			[
				{
					kana: 'する',
					fr: 'coûter',
					primary: 'to cost',
					reviewed: true,
				},
			],
		);
		expect(frequent?.senses.map((sense) => sense.gloss.en)).toEqual([
			'to cost',
			'to do',
		]);
		expect(frequent?.senses[0]?.gloss.fr).toBe('coûter');
	});

	it('refuses an override without a word', () => {
		expect(() =>
			applyOverrides([], [{ kana: 'ぬ', fr: 'x', reviewed: true }]),
		).toThrow('ぬ');
	});

	it('refuses a sense that does not exist', () => {
		expect(() =>
			applyOverrides(
				[word('する', FREQUENT)],
				[{ kana: 'する', fr: 'x', primary: 'nope', reviewed: true }],
			),
		).toThrow('nope');
	});
});
