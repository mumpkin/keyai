import { describe, expect, it } from 'vitest';
import { tokenize, UnknownKanaError } from './tokenize.ts';

function textsOf(word: string): string[] {
	return tokenize(word).map((unit) => unit.text);
}

describe('tokenize', () => {
	it.each([
		['いぬ', ['い', 'ぬ']],
		['きゃく', ['きゃ', 'く']],
		['がっこう', ['が', 'っ', 'こ', 'う']],
		['コーヒー', ['コ', 'ー', 'ヒ', 'ー']],
		['パーティー', ['パ', 'ー', 'ティ', 'ー']],
		['ウォーター', ['ウォ', 'ー', 'タ', 'ー']],
		['ヴ', ['ヴ']],
	])('splits %s into units', (word, units) => {
		expect(textsOf(word)).toEqual(units);
	});

	it('normalises decomposed voiced marks', () => {
		expect(textsOf('が')).toEqual(['が']);
	});

	it('rejects characters outside the catalogue', () => {
		expect(() => tokenize('いぬa')).toThrow(UnknownKanaError);
		expect(() => tokenize('ゐ')).toThrow(/position 0/);
	});
});
