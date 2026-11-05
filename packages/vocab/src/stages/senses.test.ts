import { describe, expect, it } from 'vitest';
import { frenchSense, jmdictWord, sense } from '../test-fixtures.ts';
import {
	isAffixOnly,
	isKeptSense,
	partOfSpeechOf,
	sensesOf,
	shortGloss,
} from './senses.ts';

describe('senses', () => {
	it.each([
		['dog (Canis (lupus) familiaris)', 'dog'],
		['to do', 'to do'],
		['(something)', '(something)'],
	])('shortens %s', (text, short) => {
		expect(shortGloss(text)).toBe(short);
	});

	it.each([
		['n', 'noun'],
		['pn', 'pronoun'],
		['v5k', 'verb'],
		['adj-i', 'adjective'],
		['prt', 'particle'],
		['aux-v', 'auxiliary'],
		['unc', 'other'],
	])('maps the part of speech %s', (tag, pos) => {
		expect(partOfSpeechOf(tag)).toBe(pos);
	});

	it('drops archaic, derogatory and non-English senses', () => {
		expect(isKeptSense(sense('dog'))).toBe(true);
		expect(isKeptSense(sense('dog', { misc: ['arch'] }))).toBe(false);
		expect(isKeptSense(sense('rat', { misc: ['derog'] }))).toBe(false);
		expect(isKeptSense(sense('damn', { misc: ['vulg'] }))).toBe(true);
		expect(isKeptSense(frenchSense('chien'))).toBe(false);
	});

	it('keeps the register, the usual kanji and the notes', () => {
		const [converted] = sensesOf(
			jmdictWord('は', [
				sense('indicates sentence topic', {
					partOfSpeech: ['prt'],
					info: ['pronounced わ in modern Japanese'],
					misc: ['col'],
				}),
			]),
			'歯',
		);
		expect(converted).toEqual({
			gloss: { en: 'indicates sentence topic' },
			pos: ['particle'],
			kanji: '歯',
			register: 'familiar',
			note: { en: 'pronounced わ in modern Japanese' },
		});
	});

	it('keeps short brackets, which carry the meaning', () => {
		expect(shortGloss('free (of charge)')).toBe('free (of charge)');
		expect(shortGloss('dog (Canis (lupus) familiaris)')).toBe('dog');
	});

	it('gives the French glosses to the primary sense only', () => {
		const word = jmdictWord('ある', [
			sense('to be'),
			sense('to have'),
			frenchSense('être'),
		]);
		const [primary, other] = sensesOf(word, undefined);
		expect(primary?.gloss.fr).toBe('être');
		expect(other?.gloss.fr).toBeUndefined();
	});

	it('keeps two glosses, without duplicates', () => {
		const glosses = [
			'freedom',
			'liberty (of people and nations)',
			'liberty',
			'choice',
		];
		const word = jmdictWord('じゆう', [
			sense('', {
				gloss: glosses.map((text) => ({ lang: 'eng', text })),
			}),
		]);
		expect(sensesOf(word, undefined)[0]?.gloss.en).toBe('freedom, liberty');
	});

	it('recognises entries that are only affixes', () => {
		const suffix = [{ gloss: { en: '-ian' }, pos: ['suffix' as const] }];
		const noun = [{ gloss: { en: 'person' }, pos: ['noun' as const] }];
		expect(isAffixOnly(suffix)).toBe(true);
		expect(isAffixOnly([...suffix, ...noun])).toBe(false);
	});
});
