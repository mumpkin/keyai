import type { Sense } from '@keyai/core/vocab';
import type { Candidate } from './candidates.ts';

/** Senses kept per word, to keep the word card readable. */
export const MAX_SENSES = 6;

export function byFrequency(first: Candidate, second: Candidate): number {
	return (
		second.zipf - first.zipf ||
		(first.kana < second.kana ? -1 : Number(first.kana > second.kana))
	);
}

function mergedSenses(group: readonly Candidate[]): Sense[] {
	const seen = new Set<string>();
	const senses: Sense[] = [];
	// Each homograph gets its main sense first: the many senses of the most
	// frequent entry must not push 紙 and 神 out of かみ.
	const [mainSenses, otherSenses] = [
		group.flatMap((candidate) => candidate.senses.slice(0, 1)),
		group.flatMap((candidate) => candidate.senses.slice(1)),
	];
	for (const sense of [...mainSenses, ...otherSenses]) {
		const key = `${sense.kanji ?? ''}|${sense.gloss.en}`;
		if (!seen.has(key)) {
			seen.add(key);
			senses.push(sense);
		}
	}
	return senses.slice(0, MAX_SENSES);
}

/**
 * One word per kana spelling (A3): homographs (はし: 橋, 箸, 端) become the
 * senses of a single word, the most frequent entry first.
 */
export function mergeHomographs(candidates: readonly Candidate[]): Candidate[] {
	const groups = new Map<string, Candidate[]>();
	for (const candidate of [...candidates].sort(byFrequency)) {
		groups.set(candidate.kana, [
			...(groups.get(candidate.kana) ?? []),
			candidate,
		]);
	}
	return [...groups.values()]
		.map((group) => {
			const [first] = group as [Candidate, ...Candidate[]];
			return {
				...first,
				senses: mergedSenses(group),
				tiedEntries: group.filter((entry) => entry.zipf === first.zipf)
					.length,
			};
		})
		.sort(byFrequency);
}
