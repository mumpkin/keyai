import { describe, expect, it } from 'vitest';
import {
	findKana,
	HIRAGANA,
	KANA_CATALOGUE,
	KATAKANA,
	toKatakana,
} from './catalogue.ts';

describe('kana catalogue', () => {
	it('contains 105 hiragana and 126 katakana units', () => {
		expect(HIRAGANA).toHaveLength(105);
		expect(KATAKANA).toHaveLength(126);
	});

	it('uses each kana text only once', () => {
		const texts = KANA_CATALOGUE.map((unit) => unit.text);
		expect(new Set(texts).size).toBe(texts.length);
	});

	it('gives every unit except っ a display spelling listed first', () => {
		for (const unit of KANA_CATALOGUE) {
			if (unit.kind === 'sokuon') {
				expect(unit.romaji.accepted).toEqual([]);
			} else {
				expect(unit.romaji.accepted[0]).toBe(unit.romaji.display);
			}
		}
	});

	it('links shared units to their counterpart in both directions', () => {
		for (const unit of KANA_CATALOGUE) {
			if (unit.counterpart) {
				expect(findKana(unit.counterpart)?.counterpart).toBe(unit.text);
			}
		}
	});

	it('keeps the same rank for a kana and its counterpart', () => {
		const ki = findKana('き');
		expect(ki?.gojuon).toBe(findKana('キ')?.gojuon);
	});

	it.each([
		['し', ['shi', 'si']],
		['ち', ['chi', 'ti']],
		['を', ['wo', 'o']],
		['ぢ', ['ji', 'di']],
		['づ', ['zu', 'du']],
		['ちゃ', ['cha', 'tya', 'cya']],
		['ティ', ['ti', 'thi']],
		['ヴ', ['vu']],
		['ン', ['n', 'nn', "n'"]],
	])('accepts the expected spellings for %s', (text, spellings) => {
		expect(findKana(text)?.romaji.accepted).toEqual(spellings);
	});

	it.each(['ゐ', 'ゑ', 'ぢゃ', 'ゔ', 'ぁ', 'ゃ'])('excludes %s', (text) => {
		expect(findKana(text)).toBeUndefined();
	});

	it('reserves the long vowel mark and extended combinations to katakana', () => {
		expect(findKana('ー')?.script).toBe('katakana');
		expect(findKana('ファ')?.kind).toBe('extended');
		expect(findKana('ファ')?.counterpart).toBeUndefined();
	});

	it('converts hiragana to katakana', () => {
		expect(toKatakana('きゃっ')).toBe('キャッ');
	});
});
