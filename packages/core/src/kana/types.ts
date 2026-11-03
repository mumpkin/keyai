export type Script = 'hiragana' | 'katakana';

export type KanaKind =
	| 'base'
	| 'nasal'
	| 'voiced'
	| 'semivoiced'
	| 'combo'
	| 'extended'
	| 'sokuon'
	| 'choon';

export interface Romaji {
	/** Hepburn form shown to the user. */
	readonly display: string;
	/** Every accepted spelling, the display form first. */
	readonly accepted: readonly string[];
}

export interface KanaUnit {
	/** The kana itself, also used as the identifier ('き', 'きゃ', 'ー'). */
	readonly text: string;
	readonly script: Script;
	readonly kind: KanaKind;
	/** Rank in the reference order, used for tie-breaks and table layout. */
	readonly gojuon: number;
	/** Same unit in the other script, when it exists. */
	readonly counterpart?: string;
	readonly romaji: Romaji;
}
