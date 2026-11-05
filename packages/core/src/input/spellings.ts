import type { KanaUnit } from '../kana/types.ts';

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);
/**
 * Starts after which a single 'n' would change the reading ('kinen' reads
 * きねん). Before another n, 'konnichiha' stays readable: the matcher
 * resolves it.
 */
const AMBIGUOUS_AFTER_NASAL = /^[aiueoy]/;
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

/** Letters that can start the next kana: っち may be typed 'tchi' or 'cchi'. */
function leadingLettersOf(spelling: string): string[] {
	return spelling.startsWith('ch') ? ['t', 'c'] : [spelling.charAt(0)];
}

function isDoublingConsonant(letter: string): boolean {
	return letter !== '' && letter !== 'n' && !VOWELS.has(letter);
}

/** っ doubles the first consonant of the next kana ('kitte', 'matcha'). */
function sokuonSpellings(next: KanaUnit | undefined): string[] {
	const nextSpellings = next?.romaji.accepted ?? [];
	return unique(
		nextSpellings.flatMap(leadingLettersOf).filter(isDoublingConsonant),
	);
}

/** ー is typed '-' or as the repeated vowel of the previous kana. */
function choonSpellings(previous: KanaUnit | undefined): string[] {
	const lastLetter = previous?.romaji.display.at(-1) ?? '';
	return VOWELS.has(lastLetter) ? ['-', lastLetter] : ['-'];
}

/**
 * Vowels that lengthen the previous sound in hiragana, with the sound they
 * follow: こう reads koo, せんせい reads sensee (C1).
 */
const LONG_VOWELS: ReadonlyMap<string, string> = new Map([
	['う', 'o'],
	['い', 'e'],
]);

function regularSpellings(unit: KanaUnit, previous: KanaUnit | undefined) {
	const lengthened = LONG_VOWELS.get(unit.text);
	const isLong =
		lengthened !== undefined &&
		previous?.romaji.display.at(-1) === lengthened;
	return isLong
		? [...unit.romaji.accepted, lengthened]
		: [...unit.romaji.accepted];
}

function spellingsAt(
	units: readonly KanaUnit[],
	index: number,
	following: KanaUnit | undefined,
): string[] {
	const unit = units[index] as KanaUnit;
	const previous = units[index - 1];
	const next = units[index + 1];

	switch (unit.kind) {
		case 'nasal':
			return nasalSpellings(unit, next);
		case 'sokuon':
			return sokuonSpellings(next ?? following);
		case 'choon':
			return choonSpellings(previous);
		default:
			return regularSpellings(unit, previous);
	}
}

/**
 * Accepted spellings of every unit of a word, taking the neighbouring units
 * into account. An empty list means the unit cannot be typed in this word.
 * `following` is the unit after the word, which a final っ doubles: in a
 * sentence, なっ is followed by て.
 */
export function spellingsOf(
	units: readonly KanaUnit[],
	following?: KanaUnit,
): string[][] {
	return units.map((_, index) => spellingsAt(units, index, following));
}

export function isTypeable(units: readonly KanaUnit[]): boolean {
	return spellingsOf(units).every((spellings) => spellings.length > 0);
}
