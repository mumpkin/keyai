import { describe, expect, it } from 'vitest';
import { foldLongVowels, isHeard, toKatakana } from './heard.ts';

describe('foldLongVowels', () => {
	it('writes えい, おう, うう and doubled vowels as ー', () => {
		expect(foldLongVowels(toKatakana('えいが'))).toBe('エーガ');
		expect(foldLongVowels(toKatakana('がっこう'))).toBe('ガッコー');
		expect(foldLongVowels(toKatakana('くうき'))).toBe('クーキ');
		expect(foldLongVowels(toKatakana('おばあさん'))).toBe('オバーサン');
	});

	it('keeps the words that differ by a long vowel apart', () => {
		expect(foldLongVowels(toKatakana('おばさん'))).toBe('オバサン');
		expect(foldLongVowels(toKatakana('ゆき'))).not.toBe(
			foldLongVowels(toKatakana('ゆうき')),
		);
	});
});

describe('isHeard', () => {
	it('accepts a known spelling of the word', () => {
		expect(isHeard('学校', 'がっこう', ['学校'])).toBe(true);
	});

	it('accepts kana that sound the same, whatever the script', () => {
		expect(isHeard('センセー', 'せんせい', [])).toBe(true);
		expect(isHeard('ビール', 'びいる', [])).toBe(true);
	});

	it('ignores spaces and punctuation', () => {
		expect(isHeard(' がっこう。', 'がっこう', [])).toBe(true);
	});

	it('refuses a close word: long vowel or small っ', () => {
		expect(isHeard('おばあさん', 'おばさん', [])).toBe(false);
		expect(isHeard('切手', 'きて', ['来て'])).toBe(false);
	});

	it('refuses an empty answer', () => {
		expect(isHeard('', 'がっこう', ['学校'])).toBe(false);
	});
});
