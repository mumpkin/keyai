export type Script = 'hiragana' | 'katakana';

export type KanaKind =
	| 'base'
	| 'voiced'
	| 'semivoiced'
	| 'combo'
	| 'sokuon'
	| 'choon';

export interface Romaji {
	readonly display: string;
	readonly accepted: readonly string[];
}

export interface KanaUnit {
	readonly text: string;
	readonly script: Script;
	readonly kind: KanaKind;
	readonly gojuon: number;
	readonly counterpart?: string;
	readonly romaji: Romaji;
}
