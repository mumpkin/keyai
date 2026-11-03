import { isTypeable } from '../input/spellings.ts';
import { tokenize } from '../input/tokenize.ts';
import type { VocabWord } from './schema.ts';

/** A vocabulary word ready for selection: its units are known. */
export interface VocabEntry {
	readonly word: VocabWord;
	/** Kana texts of the word's units ('きゃく' → ['きゃ', 'く']). */
	readonly units: readonly string[];
	readonly kanaSet: ReadonlySet<string>;
}

export function entryOf(word: VocabWord): VocabEntry | undefined {
	const units = tokenize(word.kana);
	if (!isTypeable(units)) {
		return undefined;
	}
	const texts = units.map((unit) => unit.text);
	return { word, units: texts, kanaSet: new Set(texts) };
}

/** Typeable entries of a vocabulary, in the vocabulary order. */
export function indexVocabulary(words: readonly VocabWord[]): VocabEntry[] {
	return words.flatMap((word) => entryOf(word) ?? []);
}
