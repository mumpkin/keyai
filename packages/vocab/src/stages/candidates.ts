import { isTypeable, tokenize } from '@keyai/core/input';
import type { Sense } from '@keyai/core/vocab';
import type { JmdictForm, JmdictWord } from '../io/jmdict.ts';
import { isAffixOnly, isKeptSense, isUsableForm, sensesOf } from './senses.ts';

const MAX_WORD_UNITS = 8;

export interface Candidate {
	readonly id: string;
	readonly kana: string;
	readonly units: readonly string[];
	/** Zipf frequency of the usual written form. */
	readonly zipf: number;
	readonly senses: readonly Sense[];
	/** Entries merged into this word that shared its frequency. */
	readonly tiedEntries: number;
}

/** Units of a word, or `undefined` when it cannot be typed (C1, C7). */
export function unitsOf(kana: string): string[] | undefined {
	try {
		const units = tokenize(kana);
		const fits = units.length <= MAX_WORD_UNITS && isTypeable(units);
		return fits ? units.map((unit) => unit.text) : undefined;
	} catch {
		return undefined;
	}
}

function usualKanjiOf(word: JmdictWord): JmdictForm | undefined {
	const usable = word.kanji.filter(isUsableForm);
	return usable.find((form) => form.common) ?? usable[0];
}

function isUsuallyKana(word: JmdictWord): boolean {
	const [primary] = word.sense.filter(isKeptSense);
	return primary?.misc.includes('uk') ?? false;
}

/**
 * Form looked up in wordfreq: the kana for words usually written in kana
 * (`uk`) or without kanji, the usual kanji form otherwise. wordfreq counts
 * strings, not words, so only common forms are trusted: a rare word written
 * い would otherwise inherit the frequency of every い (C7).
 */
function writtenFormOf(
	word: JmdictWord,
	kana: JmdictForm,
): JmdictForm | undefined {
	const kanji = usualKanjiOf(word);
	const form = isUsuallyKana(word) || kanji === undefined ? kana : kanji;
	return form.common ? form : undefined;
}

export function candidateOf(
	word: JmdictWord,
	zipfByWord: ReadonlyMap<string, number>,
): Candidate | undefined {
	const kana = word.kana.find(isUsableForm);
	const units = kana && unitsOf(kana.text);
	const written = kana && writtenFormOf(word, kana);
	const senses = sensesOf(word, usualKanjiOf(word)?.text);
	if (!(kana && units && written) || senses.length === 0) {
		return undefined;
	}
	if (isAffixOnly(senses)) {
		return undefined;
	}
	const zipf = zipfByWord.get(written.text) ?? 0;
	return zipf > 0
		? { id: word.id, kana: kana.text, units, zipf, senses, tiedEntries: 1 }
		: undefined;
}

export function candidatesOf(
	words: readonly JmdictWord[],
	zipfByWord: ReadonlyMap<string, number>,
): Candidate[] {
	return words.flatMap((word) => candidateOf(word, zipfByWord) ?? []);
}
