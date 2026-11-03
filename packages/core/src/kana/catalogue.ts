import {
	type KanaBlock,
	type KanaEntry,
	SHARED_BLOCKS,
} from './hiragana-tables.ts';
import { KATAKANA_ONLY_BLOCKS } from './katakana-tables.ts';
import type { KanaUnit, Romaji, Script } from './types.ts';

/** Distance between a hiragana and its katakana in Unicode. */
const KATAKANA_CODE_OFFSET = 0x60;

const HIRAGANA_RANGE = /[\u3041-\u3096]/g;

export function toKatakana(hiragana: string): string {
	return hiragana.replace(HIRAGANA_RANGE, (character) =>
		String.fromCharCode(character.charCodeAt(0) + KATAKANA_CODE_OFFSET),
	);
}

function romajiOf(entry: KanaEntry): Romaji {
	const [, ...spellings] = entry;
	return { display: spellings[0] ?? '', accepted: spellings };
}

interface UnitDraft {
	readonly text: string;
	readonly kind: KanaUnit['kind'];
	readonly romaji: Romaji;
}

function draftsOf(blocks: readonly KanaBlock[]): UnitDraft[] {
	return blocks.flatMap(({ kind, entries }) =>
		entries.map((entry) => ({
			text: entry[0],
			kind,
			romaji: romajiOf(entry),
		})),
	);
}

const SHARED_DRAFTS = draftsOf(SHARED_BLOCKS);
const KATAKANA_ONLY_DRAFTS = draftsOf(KATAKANA_ONLY_BLOCKS);

function sharedUnit(
	draft: UnitDraft,
	script: Script,
	gojuon: number,
): KanaUnit {
	const katakana = toKatakana(draft.text);
	return {
		...draft,
		text: script === 'hiragana' ? draft.text : katakana,
		script,
		gojuon,
		counterpart: script === 'hiragana' ? katakana : draft.text,
	};
}

export const HIRAGANA: readonly KanaUnit[] = SHARED_DRAFTS.map(
	(draft, gojuon) => sharedUnit(draft, 'hiragana', gojuon),
);

export const KATAKANA: readonly KanaUnit[] = [
	...SHARED_DRAFTS.map((draft, gojuon) =>
		sharedUnit(draft, 'katakana', gojuon),
	),
	...KATAKANA_ONLY_DRAFTS.map((draft, index) => ({
		...draft,
		script: 'katakana' as const,
		gojuon: SHARED_DRAFTS.length + index,
	})),
];

export const KANA_CATALOGUE: readonly KanaUnit[] = [...HIRAGANA, ...KATAKANA];

const UNITS_BY_TEXT = new Map(KANA_CATALOGUE.map((unit) => [unit.text, unit]));

export function findKana(text: string): KanaUnit | undefined {
	return UNITS_BY_TEXT.get(text);
}
