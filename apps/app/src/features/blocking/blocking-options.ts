export type TranslationLayout = 'everyWord' | 'zone';
export type RomajiDisplay = 'always' | 'currentWord' | 'hidden';
export type KanaSize = 'small' | 'medium' | 'large';

export interface BlockingOptions {
	readonly translationLayout: TranslationLayout;
	readonly romajiDisplay: RomajiDisplay;
	readonly kanaSize: KanaSize;
}

export const DEFAULT_BLOCKING_OPTIONS: BlockingOptions = {
	translationLayout: 'everyWord',
	romajiDisplay: 'currentWord',
	kanaSize: 'medium',
};

export const TRANSLATION_LAYOUT_LABELS: Record<TranslationLayout, string> = {
	everyWord: 'B · sous chaque mot',
	zone: 'C · zone dédiée',
};

export const ROMAJI_DISPLAY_LABELS: Record<RomajiDisplay, string> = {
	always: 'toujours',
	currentWord: 'mot en cours seulement',
	hidden: 'jamais',
};

export const KANA_SIZE_LABELS: Record<KanaSize, string> = {
	small: 'petite',
	medium: 'moyenne',
	large: 'grande',
};
