import { describe, expect, it } from 'vitest';
import { toHepburn } from './hepburn.ts';
import { isTypeable, spellingsOf } from './spellings.ts';
import { tokenize } from './tokenize.ts';

function spellingsAt(word: string, index: number): string[] | undefined {
	return spellingsOf(tokenize(word))[index];
}

describe('spellingsOf', () => {
	it('accepts a single n for ん before a consonant or at the end', () => {
		expect(spellingsAt('ほんや', 1)).toEqual(['nn', "n'"]);
		expect(spellingsAt('さんぽ', 1)).toEqual(['n', 'nn', "n'"]);
		expect(spellingsAt('ほん', 1)).toEqual(['n', 'nn', "n'"]);
	});

	it("requires nn or n' for ん before a vowel, y or n", () => {
		expect(spellingsAt('きんえん', 1)).toEqual(['nn', "n'"]);
		expect(spellingsAt('こんにちは', 1)).toEqual(['nn', "n'"]);
	});

	it('doubles the next consonant for っ', () => {
		expect(spellingsAt('きって', 1)).toEqual(['t']);
		expect(spellingsAt('ざっし', 1)).toEqual(['s']);
		expect(spellingsAt('まっちゃ', 1)).toEqual(['t', 'c']);
	});

	it('accepts - or the previous vowel for ー', () => {
		expect(spellingsAt('コーヒー', 1)).toEqual(['-', 'o']);
		expect(spellingsAt('コーヒー', 3)).toEqual(['-', 'i']);
	});

	it('marks words ending with っ as not typeable', () => {
		expect(isTypeable(tokenize('あっ'))).toBe(false);
		expect(isTypeable(tokenize('きって'))).toBe(true);
	});
});

describe('toHepburn', () => {
	it.each([
		['きって', 'kitte'],
		['まっちゃ', 'matcha'],
		['きんえん', "kin'en"],
		['ほんや', "hon'ya"],
		['こんにちは', "kon'nichiha"],
		['んんあ', "n'n'a"],
		['ンヲ', "n'wo"],
		['さんぽ', 'sanpo'],
		['しゃしん', 'shashin'],
		['コーヒー', 'ko-hi-'],
		['は', 'ha'],
		['を', 'wo'],
	])('reads %s as %s', (word, reading) => {
		expect(toHepburn(tokenize(word))).toBe(reading);
	});
});
