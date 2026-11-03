import type { KanaUnit } from '../kana/types.ts';

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);
/** Starts after which a single 'n' would be read as part of the next kana. */
const AMBIGUOUS_AFTER_NASAL = /^[aiueoyn]/;
const NASAL_BEFORE_AMBIGUOUS = ['nn', "n'"];

function unique(spellings: readonly string[]): string[] {
	return [...new Set(spellings)];
}

/**
 * Whether a single 'n' for ん could be read as the start of the next kana,
 * in which case ん must be typed 'nn' or "n'".
 */
export function isAmbiguousAfterNasal(next: KanaUnit | undefined): boolean {
	return (
		next?.romaji.accepted.some((spelling) =>
			AMBIGUOUS_AFTER_NASAL.test(spelling),
		) ?? false
	);
}

function nasalSpellings(unit: KanaUnit, next: KanaUnit | undefined): string[] {
	return isAmbiguousAfterNasal(next)
		? NASAL_BEFORE_AMBIGUOUS
		: [...unit.romaji.accepted];
}

function doubledConsonantOf(spelling: string): string | undefined {
	const first = spelling[0];
	if (!first || VOWELS.has(first) || first === 'n') {
		return undefined;
	}
	return spelling.startsWith('ch') ? 't' : first;
}

/** っ doubles the first consonant of the next kana ('kitte', 'matcha'). */
function sokuonSpellings(next: KanaUnit | undefined): string[] {
	const nextSpellings = next?.romaji.accepted ?? [];
	const firstLetters = nextSpellings.map((spelling) => spelling[0] ?? '');
	const doubled = nextSpellings
		.map(doubledConsonantOf)
		.filter((consonant) => consonant !== undefined);
	const accepted = [...doubled, ...firstLetters].filter(
		(letter) => letter !== '' && !VOWELS.has(letter) && letter !== 'n',
	);
	return unique(accepted);
}

/** ー is typed '-' or as the repeated vowel of the previous kana. */
function choonSpellings(previous: KanaUnit | undefined): string[] {
	const lastLetter = previous?.romaji.display.at(-1) ?? '';
	return VOWELS.has(lastLetter) ? ['-', lastLetter] : ['-'];
}

function spellingsAt(units: readonly KanaUnit[], index: number): string[] {
	const unit = units[index] as KanaUnit;
	const previous = units[index - 1];
	const next = units[index + 1];

	switch (unit.kind) {
		case 'nasal':
			return nasalSpellings(unit, next);
		case 'sokuon':
			return sokuonSpellings(next);
		case 'choon':
			return choonSpellings(previous);
		default:
			return [...unit.romaji.accepted];
	}
}

/**
 * Accepted spellings of every unit of a word, taking the neighbouring units
 * into account. An empty list means the unit cannot be typed in this word.
 */
export function spellingsOf(units: readonly KanaUnit[]): string[][] {
	return units.map((_, index) => spellingsAt(units, index));
}

export function isTypeable(units: readonly KanaUnit[]): boolean {
	return spellingsOf(units).every((spellings) => spellings.length > 0);
}
