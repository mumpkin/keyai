import {
	indexVocabulary,
	type VocabEntry,
	type VocabFile,
	VocabFileSchema,
} from '@keyai/core/vocab';

/** The vocabulary, loaded once and read-only (A5). */
export interface Vocabulary {
	readonly file: VocabFile;
	readonly entries: readonly VocabEntry[];
	readonly entriesById: ReadonlyMap<string, VocabEntry>;
}

export function vocabularyOf(data: unknown): Vocabulary {
	const file = VocabFileSchema.parse(data);
	const entries = indexVocabulary(file.words);
	return {
		file,
		entries,
		entriesById: new Map(entries.map((entry) => [entry.word.id, entry])),
	};
}

/** Adds cards that can be looked up, without any effect on the series. */
export function withCards(
	vocabulary: Vocabulary,
	cards: readonly VocabEntry[],
): Vocabulary {
	const entriesById = new Map(vocabulary.entriesById);
	for (const card of cards) {
		entriesById.set(card.word.id, entriesById.get(card.word.id) ?? card);
	}
	return { ...vocabulary, entriesById };
}

/** Loads the generated vocabulary in its own chunk, after the app shell. */
export async function loadVocabulary(): Promise<Vocabulary> {
	const module = await import('@keyai/vocab/vocab.json');
	return vocabularyOf(module.default);
}
