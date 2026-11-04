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

/** "dog (Canis (lupus) familiaris)" → "dog". */
export function shortGloss(text: string): string {
	const shortened = text
		.replace(/\s*\((?:[^()]|\([^()]*\))*\)\s*$/, '')
		.trim();
	return shortened === '' ? text : shortened;
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

function firstGloss(senses: readonly JmdictSense[], lang: string) {
	const gloss = senses
		.flatMap((sense) => sense.gloss)
		.find((candidate) => candidate.lang === lang);
	return gloss && shortGloss(gloss.text);
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
			en: firstGloss([sense], 'eng') ?? '',
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
 * separate senses that are not aligned with the English ones: a French
 * gloss is only trusted when the entry has a single sense.
 */
export function sensesOf(word: JmdictWord, kanji: string | undefined): Sense[] {
	const kept = word.sense.filter(isKeptSense);
	const french =
		kept.length === 1 ? firstGloss(word.sense, 'fre') : undefined;
	return kept.map((sense) => senseOf(sense, { kanji, french }));
}

const AFFIXES = new Set<PartOfSpeech>(['suffix', 'prefix', 'counter']);

/** Suffixes, prefixes and counters are not standalone words (C7). */
export function isAffixOnly(senses: readonly Sense[]): boolean {
	return senses.every((sense) => sense.pos.every((pos) => AFFIXES.has(pos)));
}
