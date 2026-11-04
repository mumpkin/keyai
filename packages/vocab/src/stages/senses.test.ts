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

	it('only trusts a French gloss when the entry has a single sense', () => {
		const single = jmdictWord('いぬ', [sense('dog'), frenchSense('chien')]);
		const several = jmdictWord('にち', [
			sense('Sunday'),
			sense('day'),
			frenchSense('dimanche'),
		]);
		expect(sensesOf(single, undefined)[0]?.gloss.fr).toBe('chien');
		expect(sensesOf(several, undefined)[0]?.gloss.fr).toBeUndefined();
	});

	it('recognises entries that are only affixes', () => {
		const suffix = [{ gloss: { en: '-ian' }, pos: ['suffix' as const] }];
		const noun = [{ gloss: { en: 'person' }, pos: ['noun' as const] }];
		expect(isAffixOnly(suffix)).toBe(true);
		expect(isAffixOnly([...suffix, ...noun])).toBe(false);
	});
});
