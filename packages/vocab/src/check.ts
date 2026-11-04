import { readFileSync } from 'node:fs';
import { indexVocabulary, VocabFileSchema } from '@keyai/core/vocab';
import { VOCABULARY_FILE } from './io/sources.ts';

/** Validates `data/vocab.json`: schema and typeability of every word. */
export function checkVocabulary(): boolean {
	const parsed = VocabFileSchema.safeParse(
		JSON.parse(readFileSync(VOCABULARY_FILE, 'utf8')),
	);
	if (!parsed.success) {
		console.error(parsed.error.message);
		return false;
	}
	const typeable = indexVocabulary(parsed.data.words).length;
	const untypeable = parsed.data.words.length - typeable;
	if (untypeable > 0) {
		console.error(`✗ ${untypeable} words cannot be typed`);
		return false;
	}
	console.log(`✓ ${typeable} words valid and typeable`);
	return true;
}
