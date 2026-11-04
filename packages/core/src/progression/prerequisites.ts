import { findKana } from '../kana/catalogue.ts';
import type { KanaUnit } from '../kana/types.ts';

/** Small kana and their full-size form ('ゃ' → 'や', 'ィ' → 'イ'). */
const SMALL_KANA = new Set([...'ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ']);

function fullSize(character: string): string {
	return SMALL_KANA.has(character)
		? String.fromCharCode(character.charCodeAt(0) + 1)
		: character;
}

/** 'が' → 'か', 'ぱ' → 'は', 'ヴ' → 'ウ'; other kana are unchanged. */
function withoutVoicingMark(character: string): string {
	return character.normalize('NFD').charAt(0);
}

function componentsOf(unit: KanaUnit): string[] {
	const characters = [...unit.text];
	if (characters.length === 1) {
		const base = withoutVoicingMark(unit.text);
		return base === unit.text ? [] : [base];
	}
	return characters.map(fullSize);
}

/**
 * Kana that must be unlocked before this one (C2): the unvoiced form of a
 * voiced kana, the components of a combination, and for katakana the
 * hiragana counterpart.
 */
export function prerequisitesOf(unit: KanaUnit): string[] {
	const prerequisites = componentsOf(unit).filter(
		(text) => text !== unit.text && findKana(text) !== undefined,
	);
	if (unit.script === 'katakana' && unit.counterpart) {
		prerequisites.push(unit.counterpart);
	}
	return [...new Set(prerequisites)];
}
