import { KANA_CATALOGUE, type Script, toKatakana } from '@keyai/core/kana';

/** Gap in a column of the gojūon chart. */
const GAP = '・';

const BASE_COLUMNS = [
	'あいうえお',
	'かきくけこ',
	'さしすせそ',
	'たちつてと',
	'なにぬねの',
	'はひふへほ',
	'まみむめも',
	`や${GAP}ゆ${GAP}よ`,
	'らりるれろ',
	`わ${GAP}${GAP}${GAP}を`,
	`ん${GAP}${GAP}${GAP}${GAP}`,
];

const VOICED_COLUMNS = [
	'がぎぐげご',
	'ざじずぜぞ',
	'だぢづでど',
	'ばびぶべぼ',
	'ぱぴぷぺぽ',
];

const COMBINATION_INITIALS = [...'きしちにひみりぎじびぴ'];
const COMBINATION_ENDINGS = [...'ゃゅょ'];

export interface KanaSlot {
	readonly id: string;
	readonly kana: string | null;
}

export interface KanaLayout {
	/** Columns of five rows (a, i, u, e, o). */
	readonly base: readonly KanaSlot[];
	readonly voiced: readonly KanaSlot[];
	/** Rows of three (ya, yu, yo). */
	readonly combinations: readonly KanaSlot[];
	readonly others: readonly KanaSlot[];
}

function slotsOf(texts: readonly string[], script: Script): KanaSlot[] {
	return texts.map((text, index) => {
		const kana = text === GAP ? null : text;
		const converted =
			kana && script === 'katakana' ? toKatakana(kana) : kana;
		return { id: `${index}:${converted ?? GAP}`, kana: converted };
	});
}

function othersOf(script: Script): string[] {
	return KANA_CATALOGUE.filter(
		(unit) =>
			unit.script === script &&
			['sokuon', 'choon', 'extended'].includes(unit.kind),
	).map((unit) => unit.text);
}

/** Layout of the reference table, like the gojūon chart (C2). */
export function kanaLayoutOf(script: Script): KanaLayout {
	const combinations = COMBINATION_INITIALS.flatMap((initial) =>
		COMBINATION_ENDINGS.map((ending) => initial + ending),
	);
	return {
		base: slotsOf(
			BASE_COLUMNS.flatMap((column) => [...column]),
			script,
		),
		voiced: slotsOf(
			VOICED_COLUMNS.flatMap((column) => [...column]),
			script,
		),
		combinations: slotsOf(combinations, script),
		others: slotsOf(othersOf(script), 'hiragana'),
	};
}
