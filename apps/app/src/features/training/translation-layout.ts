export type TranslationLayout = 'lastWord' | 'everyWord' | 'zone';

export const TRANSLATION_LAYOUTS: Record<TranslationLayout, string> = {
	lastWord: 'Sous le dernier mot',
	everyWord: 'Sous chaque mot',
	zone: 'Zone dédiée',
};
