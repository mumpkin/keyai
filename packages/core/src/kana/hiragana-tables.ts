import type { KanaKind } from './types.ts';

/** A kana followed by its accepted spellings, the Hepburn form first. */
export type KanaEntry = readonly [kana: string, ...spellings: string[]];

export interface KanaBlock {
	readonly kind: KanaKind;
	readonly entries: readonly KanaEntry[];
}

const BASE: readonly KanaEntry[] = [
	['あ', 'a'],
	['い', 'i'],
	['う', 'u'],
	['え', 'e'],
	['お', 'o'],
	['か', 'ka'],
	['き', 'ki'],
	['く', 'ku'],
	['け', 'ke'],
	['こ', 'ko'],
	['さ', 'sa'],
	['し', 'shi', 'si'],
	['す', 'su'],
	['せ', 'se'],
	['そ', 'so'],
	['た', 'ta'],
	['ち', 'chi', 'ti'],
	['つ', 'tsu', 'tu'],
	['て', 'te'],
	['と', 'to'],
	['な', 'na'],
	['に', 'ni'],
	['ぬ', 'nu'],
	['ね', 'ne'],
	['の', 'no'],
	['は', 'ha'],
	['ひ', 'hi'],
	['ふ', 'fu', 'hu'],
	['へ', 'he'],
	['ほ', 'ho'],
	['ま', 'ma'],
	['み', 'mi'],
	['む', 'mu'],
	['め', 'me'],
	['も', 'mo'],
	['や', 'ya'],
	['ゆ', 'yu'],
	['よ', 'yo'],
	['ら', 'ra'],
	['り', 'ri'],
	['る', 'ru'],
	['れ', 're'],
	['ろ', 'ro'],
	['わ', 'wa'],
	['を', 'wo', 'o'],
];

const NASAL: readonly KanaEntry[] = [['ん', 'n', 'nn', "n'"]];

const VOICED: readonly KanaEntry[] = [
	['が', 'ga'],
	['ぎ', 'gi'],
	['ぐ', 'gu'],
	['げ', 'ge'],
	['ご', 'go'],
	['ざ', 'za'],
	['じ', 'ji', 'zi'],
	['ず', 'zu'],
	['ぜ', 'ze'],
	['ぞ', 'zo'],
	['だ', 'da'],
	['ぢ', 'ji', 'di'],
	['づ', 'zu', 'du'],
	['で', 'de'],
	['ど', 'do'],
	['ば', 'ba'],
	['び', 'bi'],
	['ぶ', 'bu'],
	['べ', 'be'],
	['ぼ', 'bo'],
];

const SEMIVOICED: readonly KanaEntry[] = [
	['ぱ', 'pa'],
	['ぴ', 'pi'],
	['ぷ', 'pu'],
	['ぺ', 'pe'],
	['ぽ', 'po'],
];

const COMBO: readonly KanaEntry[] = [
	['きゃ', 'kya'],
	['きゅ', 'kyu'],
	['きょ', 'kyo'],
	['しゃ', 'sha', 'sya'],
	['しゅ', 'shu', 'syu'],
	['しょ', 'sho', 'syo'],
	['ちゃ', 'cha', 'tya', 'cya'],
	['ちゅ', 'chu', 'tyu', 'cyu'],
	['ちょ', 'cho', 'tyo', 'cyo'],
	['にゃ', 'nya'],
	['にゅ', 'nyu'],
	['にょ', 'nyo'],
	['ひゃ', 'hya'],
	['ひゅ', 'hyu'],
	['ひょ', 'hyo'],
	['みゃ', 'mya'],
	['みゅ', 'myu'],
	['みょ', 'myo'],
	['りゃ', 'rya'],
	['りゅ', 'ryu'],
	['りょ', 'ryo'],
	['ぎゃ', 'gya'],
	['ぎゅ', 'gyu'],
	['ぎょ', 'gyo'],
	['じゃ', 'ja', 'zya', 'jya'],
	['じゅ', 'ju', 'zyu', 'jyu'],
	['じょ', 'jo', 'zyo', 'jyo'],
	['びゃ', 'bya'],
	['びゅ', 'byu'],
	['びょ', 'byo'],
	['ぴゃ', 'pya'],
	['ぴゅ', 'pyu'],
	['ぴょ', 'pyo'],
];

/** Small っ: its spelling doubles the next consonant (see core/input). */
const SOKUON: readonly KanaEntry[] = [['っ']];

/** Blocks shared by both scripts, in reference order. */
export const SHARED_BLOCKS: readonly KanaBlock[] = [
	{ kind: 'base', entries: BASE },
	{ kind: 'nasal', entries: NASAL },
	{ kind: 'voiced', entries: VOICED },
	{ kind: 'semivoiced', entries: SEMIVOICED },
	{ kind: 'combo', entries: COMBO },
	{ kind: 'sokuon', entries: SOKUON },
];
