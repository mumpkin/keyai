import { findKana } from '../kana/catalogue.ts';
import { masteryOf } from '../progression/mastery.ts';
import type { Progress } from '../progression/schema.ts';
import type { WordScript } from '../settings/schema.ts';
import type { VocabEntry } from '../vocab/entries.ts';

export interface SelectionContext {
	readonly entries: readonly VocabEntry[];
	readonly unlocked: ReadonlySet<string>;
	/** Weakest kana, or the last unlocked one, favoured in the series (C5). */
	readonly featuredKana: string | undefined;
	/** Unlocked kana that are not mastered, weakest first. */
	readonly weakKana: readonly string[];
}

function isInScript(kana: string, script: WordScript): boolean {
	return script === 'both' || findKana(kana)?.script === script;
}

export interface SelectionRules {
	readonly thresholdKanaPerMinute: number;
	readonly script?: WordScript;
}

/** With one script alone, only its words and its kana are practised. */
function keptEntries(entries: readonly VocabEntry[], script: WordScript) {
	const kept = entries.filter((entry) =>
		entry.units.every((kana) => isInScript(kana, script)),
	);
	return kept.length > 0 ? kept : entries;
}

export function selectionContextOf(
	allEntries: readonly VocabEntry[],
	progress: Progress,
	{ thresholdKanaPerMinute, script = 'both' }: SelectionRules,
): SelectionContext {
	const entries = keptEntries(allEntries, script);
	const practised = progress.unlocked.filter((kana) =>
		isInScript(kana, script),
	);
	const scored = practised.map((kana) => ({
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
		featuredKana: weakKana[0] ?? practised.at(-1),
		weakKana,
	};
}
