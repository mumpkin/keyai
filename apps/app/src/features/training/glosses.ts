import type { Locale } from '@keyai/core/settings';
import type { PartOfSpeech, Register, Sense } from '@keyai/core/vocab';

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

export const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
	noun: 'nom',
	pronoun: 'pronom',
	verb: 'verbe',
	adjective: 'adjectif',
	adverb: 'adverbe',
	particle: 'particule',
	conjunction: 'conjonction',
	interjection: 'interjection',
	counter: 'compteur',
	prefix: 'préfixe',
	suffix: 'suffixe',
	auxiliary: 'auxiliaire',
	expression: 'expression',
	other: 'autre',
};

export const REGISTER_LABELS: Record<Register, string> = {
	familiar: 'familier',
	slang: 'argot',
	vulgar: 'vulgaire',
	polite: 'poli',
	humble: 'humble',
	honorific: 'honorifique',
};
