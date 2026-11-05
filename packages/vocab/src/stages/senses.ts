import type { PartOfSpeech, Register, Sense } from '@keyai/core/vocab';
import type { JmdictForm, JmdictSense, JmdictWord } from '../io/jmdict.ts';

/** Senses we leave out (C7): not current Japanese, slurs, proper names. */
const EXCLUDED_MISC = new Set([
	'arch',
	'obs',
	'rare',
	'dated',
	'derog',
	'sens',
	'organization',
	'company',
	'product',
	'work',
	'place',
	'person',
	'surname',
	'ev',
	'ship',
	'char',
	'serv',
	'proverb',
	'quote',
	'yoji',
]);

/** Search-only, outdated, rare or irregular forms. */
const EXCLUDED_FORM_TAGS = new Set([
	'sk',
	'ok',
	'rk',
	'ik',
	'sK',
	'oK',
	'rK',
	'iK',
]);

const REGISTER_BY_MISC: ReadonlyMap<string, Register> = new Map([
	['vulg', 'vulgar'],
	['X', 'vulgar'],
	['sl', 'slang'],
	['net-sl', 'slang'],
	['m-sl', 'slang'],
	['col', 'familiar'],
	['fam', 'familiar'],
	['pol', 'polite'],
	['hum', 'humble'],
	['hon', 'honorific'],
]);

const PART_OF_SPEECH_PREFIXES: readonly (readonly [string, PartOfSpeech])[] = [
	['pn', 'pronoun'],
	['n', 'noun'],
	['v', 'verb'],
	['adj', 'adjective'],
	['adv', 'adverb'],
	['prt', 'particle'],
	['conj', 'conjunction'],
	['int', 'interjection'],
	['ctr', 'counter'],
	['pref', 'prefix'],
	['suf', 'suffix'],
	['aux', 'auxiliary'],
	['exp', 'expression'],
];

export function partOfSpeechOf(tag: string): PartOfSpeech {
	const match = PART_OF_SPEECH_PREFIXES.find(([prefix]) =>
		tag.startsWith(prefix),
	);
	return match?.[1] ?? 'other';
}

/** Short brackets carry the meaning: "free (of charge)", "just (now)". */
const KEPT_BRACKET_LENGTH = 15;

/** "dog (Canis (lupus) familiaris)" → "dog". */
export function shortGloss(text: string): string {
	const shortened = text
		.replace(/\s*\((?:[^()]|\([^()]*\))*\)\s*$/, '')
		.trim();
	const isBracketShort =
		text.length - shortened.length <= KEPT_BRACKET_LENGTH;
	return shortened === '' || isBracketShort ? text : shortened;
}

export function isUsableForm(form: JmdictForm): boolean {
	return !form.tags.some((tag) => EXCLUDED_FORM_TAGS.has(tag));
}

export function isKeptSense(sense: JmdictSense): boolean {
	return (
		sense.gloss.some((gloss) => gloss.lang === 'eng') &&
		!sense.misc.some((misc) => EXCLUDED_MISC.has(misc))
	);
}

/** One word often hides a nuance: "liberté" comes second in 自由. */
const SHOWN_GLOSSES = 2;

/** The first glosses of the first sense in this language, shortened. */
function glossesOf(senses: readonly JmdictSense[], lang: string) {
	const texts = senses
		.map((sense) => sense.gloss.filter((gloss) => gloss.lang === lang))
		.find((glosses) => glosses.length > 0)
		?.map((gloss) => shortGloss(gloss.text));
	return texts && [...new Set(texts)].slice(0, SHOWN_GLOSSES).join(', ');
}

interface SenseContext {
	readonly kanji: string | undefined;
	readonly french: string | undefined;
}

function senseOf(sense: JmdictSense, context: SenseContext): Sense {
	const register = sense.misc
		.map((misc) => REGISTER_BY_MISC.get(misc))
		.find((value) => value !== undefined);
	const [info] = sense.info;
	return {
		gloss: {
			en: glossesOf([sense], 'eng') ?? '',
			...(context.french ? { fr: context.french } : {}),
		},
		pos: [...new Set(sense.partOfSpeech.map(partOfSpeechOf))],
		...(context.kanji ? { kanji: context.kanji } : {}),
		...(register ? { register } : {}),
		...(info ? { note: { en: info } } : {}),
	};
}

/**
 * Senses of a JMdict entry in our format. JMdict keeps French glosses in
 * separate senses that are not aligned with the English ones, but they mostly
 * start with the main meaning: they go to the primary sense only.
 */
export function sensesOf(word: JmdictWord, kanji: string | undefined): Sense[] {
	const french = glossesOf(word.sense, 'fre');
	return word.sense
		.filter(isKeptSense)
		.map((sense, index) =>
			senseOf(sense, { kanji, french: index === 0 ? french : undefined }),
		);
}

const AFFIXES = new Set<PartOfSpeech>(['suffix', 'prefix', 'counter']);

/** Suffixes, prefixes and counters are not standalone words (C7). */
export function isAffixOnly(senses: readonly Sense[]): boolean {
	return senses.every((sense) => sense.pos.every((pos) => AFFIXES.has(pos)));
}
