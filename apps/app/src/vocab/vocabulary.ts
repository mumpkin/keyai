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

/** Loads the generated vocabulary in its own chunk, after the app shell. */
export async function loadVocabulary(): Promise<Vocabulary> {
	const module = await import('@keyai/vocab/vocab.json');
	return vocabularyOf(module.default);
}
