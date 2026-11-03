import { describe, expect, it } from 'vitest';
import { entryOf, indexVocabulary } from './entries.ts';
import { VocabFileSchema } from './schema.ts';
import { wordOf } from './test-words.ts';

describe('entryOf', () => {
	it('splits a word into units', () => {
		const entry = entryOf(wordOf('きゃく'));
		expect(entry?.units).toEqual(['きゃ', 'く']);
		expect(entry?.kanaSet.has('きゃ')).toBe(true);
	});

	it('drops words that cannot be typed', () => {
		expect(entryOf(wordOf('あっ'))).toBeUndefined();
		expect(indexVocabulary([wordOf('いぬ'), wordOf('あっ')])).toHaveLength(
			1,
		);
	});
});

describe('VocabFileSchema', () => {
	const file = {
		schemaVersion: 1,
		sources: { jmdict: '3.6.1', wordfreq: '3.1.1' },
		unlockOrder: ['い', 'の'],
		initialUnlocked: 2,
		words: [
			{
				id: '1',
				kana: 'は',
				rank: 3,
				senses: [
					{
						gloss: { en: 'topic marker', fr: 'particule de thème' },
						pos: ['particle'],
						note: { fr: 'Se prononce wa.' },
					},
					{ gloss: { en: 'tooth' }, pos: ['noun'], kanji: '歯' },
				],
			},
		],
	};

	it('accepts a valid vocabulary file', () => {
		expect(VocabFileSchema.parse(file)).toEqual(file);
	});

	it('rejects a word without sense or with an unknown part of speech', () => {
		const withoutSense = {
			...file,
			words: [{ ...file.words[0], senses: [] }],
		};
		const unknownPos = {
			...file,
			words: [
				{
					...file.words[0],
					senses: [{ gloss: { en: 'x' }, pos: ['name'] }],
				},
			],
		};
		expect(VocabFileSchema.safeParse(withoutSense).success).toBe(false);
		expect(VocabFileSchema.safeParse(unknownPos).success).toBe(false);
	});
});
