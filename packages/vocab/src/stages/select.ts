import type { Candidate } from './candidates.ts';

export const MIN_WORDS_PER_KANA = 5;

export interface Selection {
	readonly words: readonly Candidate[];
	/** Words added beyond the target size so every kana has enough words. */
	readonly coverageAdditions: number;
}

function countByKana(words: readonly Candidate[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const word of words) {
		for (const kana of new Set(word.units)) {
			counts.set(kana, (counts.get(kana) ?? 0) + 1);
		}
	}
	return counts;
}

/**
 * The most frequent words, then the most frequent words containing each
 * under-represented kana until it has at least five words (C7).
 * `words` must be sorted by frequency.
 */
export function selectWords(
	words: readonly Candidate[],
	targetSize: number,
	catalogue: readonly string[],
): Selection {
	const selected = words.slice(0, targetSize);
	const remaining = words.slice(targetSize);
	const counts = countByKana(selected);
	for (const kana of catalogue) {
		const missing = MIN_WORDS_PER_KANA - (counts.get(kana) ?? 0);
		const additions = remaining
			.filter(
				(word) => word.units.includes(kana) && !selected.includes(word),
			)
			.slice(0, Math.max(0, missing));
		for (const word of additions) {
			selected.push(word);
			for (const unit of new Set(word.units)) {
				counts.set(unit, (counts.get(unit) ?? 0) + 1);
			}
		}
	}
	return {
		words: selected,
		coverageAdditions: selected.length - Math.min(targetSize, words.length),
	};
}
