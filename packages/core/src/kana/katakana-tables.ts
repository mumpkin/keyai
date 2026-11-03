import type { KanaBlock, KanaEntry } from './hiragana-tables.ts';

/** Katakana combinations used in loanwords, with no hiragana counterpart. */
const EXTENDED: readonly KanaEntry[] = [
	['ティ', 'ti', 'thi'],
	['ディ', 'di', 'dhi'],
	['トゥ', 'tu', 'twu'],
	['ドゥ', 'du', 'dwu'],
	['ファ', 'fa'],
	['フィ', 'fi'],
	['フェ', 'fe'],
	['フォ', 'fo'],
	['ヴァ', 'va'],
	['ヴィ', 'vi'],
	['ヴ', 'vu'],
	['ヴェ', 've'],
	['ヴォ', 'vo'],
	['ウィ', 'wi'],
	['ウェ', 'we'],
	['ウォ', 'wo'],
	['シェ', 'she', 'sye'],
	['ジェ', 'je', 'zye', 'jye'],
	['チェ', 'che', 'tye', 'cye'],
	['ツァ', 'tsa'],
];

/** Long vowel mark: '-' or the repeated previous vowel (see core/input). */
const CHOON: readonly KanaEntry[] = [['ー', '-']];

export const KATAKANA_ONLY_BLOCKS: readonly KanaBlock[] = [
	{ kind: 'extended', entries: EXTENDED },
	{ kind: 'choon', entries: CHOON },
];
