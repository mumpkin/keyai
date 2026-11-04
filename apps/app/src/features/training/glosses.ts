import type { Locale } from '@keyai/core/settings';
import type { Sense } from '@keyai/core/vocab';

export interface LocalisedText {
	readonly text: string;
	/** French was missing: the English text is shown with an EN badge (C7). */
	readonly isFallback: boolean;
}

export function glossOf(sense: Sense, locale: Locale): LocalisedText {
	const french = locale === 'fr' ? sense.gloss.fr : undefined;
	return {
		text: french ?? sense.gloss.en,
		isFallback: locale === 'fr' && french === undefined,
	};
}

export function noteOf(sense: Sense, locale: Locale): string | undefined {
	return sense.note?.[locale] ?? sense.note?.en;
}
