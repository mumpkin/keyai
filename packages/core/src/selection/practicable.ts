import type { VocabEntry } from '../vocab/entries.ts';

/**
 * Kana that appear in at least one word typeable with the unlocked kana:
 * the only ones that can be practised, hence required to be mastered (C4).
 */
export function practicableKanaOf(
	entries: readonly VocabEntry[],
	unlocked: ReadonlySet<string>,
): Set<string> {
	const practicable = new Set<string>();
	for (const entry of entries) {
		if (entry.units.every((kana) => unlocked.has(kana))) {
			for (const kana of entry.units) {
				practicable.add(kana);
			}
		}
	}
	return practicable;
}
