import { computeUnlockOrder } from '@keyai/core/progression';
import type { VocabFile } from '@keyai/core/vocab';
import type { Sources } from '../io/sources.ts';
import type { Candidate } from './candidates.ts';
import { byFrequency } from './merge.ts';

/** The vocabulary file written by the pipeline (A3), ranked by frequency. */
export function vocabularyOf(
	words: readonly Candidate[],
	sources: Sources,
): VocabFile {
	const ranked = [...words].sort(byFrequency);
	const { order, initialUnlocked } = computeUnlockOrder(
		ranked.map((word) => ({ units: word.units, weight: word.zipf })),
	);
	return {
		schemaVersion: 1,
		sources: {
			jmdict: sources.jmdict.version,
			wordfreq: sources.wordfreq.version,
		},
		unlockOrder: [...order],
		initialUnlocked,
		words: ranked.map((word, index) => ({
			id: word.id,
			kana: word.kana,
			rank: index + 1,
			senses: [...word.senses],
		})),
	};
}
