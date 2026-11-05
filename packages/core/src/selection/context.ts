import { masteryOf } from '../progression/mastery.ts';
import type { Progress } from '../progression/schema.ts';
import type { VocabEntry } from '../vocab/entries.ts';

export interface SelectionContext {
	readonly entries: readonly VocabEntry[];
	readonly unlocked: ReadonlySet<string>;
	/** Weakest kana, or the last unlocked one, favoured in the series (C5). */
	readonly featuredKana: string | undefined;
	/** Unlocked kana that are not mastered, weakest first. */
	readonly weakKana: readonly string[];
}

export function selectionContextOf(
	entries: readonly VocabEntry[],
	progress: Progress,
	thresholdKanaPerMinute: number,
): SelectionContext {
	const scored = progress.unlocked.map((kana) => ({
		kana,
		mastery: masteryOf(progress.kana[kana], thresholdKanaPerMinute),
	}));
	const weakKana = scored
		.filter(({ mastery }) => !mastery.isMastered)
		.sort((first, second) => first.mastery.score - second.mastery.score)
		.map(({ kana }) => kana);
	return {
		entries,
		unlocked: new Set(progress.unlocked),
		featuredKana: weakKana[0] ?? progress.unlocked.at(-1),
		weakKana,
	};
}
