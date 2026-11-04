import { describe, expect, it } from 'vitest';
import { findKana } from '../kana/catalogue.ts';
import { prerequisitesOf } from './prerequisites.ts';

function prerequisitesOfText(text: string): string[] {
	const unit = findKana(text);
	if (!unit) {
		throw new Error(`Unknown kana ${text}`);
	}
	return prerequisitesOf(unit);
}

describe('prerequisitesOf', () => {
	it.each([
		['あ', []],
		['が', ['か']],
		['ぱ', ['は']],
		['きゃ', ['き', 'や']],
		['じょ', ['じ', 'よ']],
		['っ', []],
		['カ', ['か']],
		['ガ', ['カ', 'が']],
		['キャ', ['キ', 'ヤ', 'きゃ']],
		['ティ', ['テ', 'イ']],
		['ヴ', ['ウ']],
		['ヴァ', ['ヴ', 'ア']],
		['ー', []],
		['ン', ['ん']],
	])('requires %s to come after %j', (text, prerequisites) => {
		expect(prerequisitesOfText(text)).toEqual(prerequisites);
	});
});
