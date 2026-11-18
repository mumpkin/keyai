/**
 * Decides whether the recognizer heard the expected word.
 *
 * The recognizer answers in kanji or kana (学校, がっこう). Without a
 * pronunciation dictionary in the browser, a word is heard when the answer
 * is one of its known spellings, or sounds the same once written in
 * katakana with every long vowel as ー (えいが = エーガ).
 */

const IGNORED = /[\s。、，．！？!?.,・「」『』]/gu;

const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KATAKANA_OFFSET = 0x60;

const E_COLUMN = 'エケセテネヘメレゲゼデベペェ';
const O_COLUMN = 'オコソトノホモヨロゴゾドボポョォ';
const U_COLUMN = 'ウクスツヌフムユルグズヅブプュゥ';

/** The vowel each kana ends with, for the kana that matter here. */
const COLUMNS: readonly (readonly [vowel: string, column: string])[] = [
	['ア', 'アカサタナハマヤラワガザダバパャァ'],
	['イ', 'イキシチニヒミリギジヂビピィ'],
	['ウ', U_COLUMN],
	['エ', E_COLUMN],
	['オ', O_COLUMN],
];
const VOWEL_OF = new Map<string, string>(
	COLUMNS.flatMap(([vowel, column]) =>
		Array.from(column, (kana): [string, string] => [kana, vowel]),
	),
);

export function toKatakana(text: string): string {
	return Array.from(text, (character) => {
		const code = character.codePointAt(0) ?? 0;
		return code >= HIRAGANA_START && code <= HIRAGANA_END
			? String.fromCodePoint(code + KATAKANA_OFFSET)
			: character;
	}).join('');
}

/** Writes every long vowel as ー: えい, おう and doubled vowels sound alike. */
export function foldLongVowels(katakana: string): string {
	const output: string[] = [];
	for (const character of katakana) {
		const previous = output.at(-1) ?? '';
		const vowel = VOWEL_OF.get(previous);
		const lengthensE = character === 'イ' && vowel === 'エ';
		const lengthensO =
			character === 'ウ' && (vowel === 'オ' || vowel === 'ウ');
		const doubled = 'アイウエオ'.includes(character) && vowel === character;
		output.push(lengthensE || lengthensO || doubled ? 'ー' : character);
	}
	return output.join('');
}

function soundOf(text: string): string {
	return foldLongVowels(toKatakana(text));
}

export function isHeard(
	heard: string,
	kana: string,
	spellings: readonly string[],
): boolean {
	const text = heard.replace(IGNORED, '');
	if (text === '') {
		return false;
	}
	return spellings.includes(text) || soundOf(text) === soundOf(kana);
}
