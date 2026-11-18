import { findKana } from '../kana/catalogue.ts';
import { masteryOf } from '../progression/mastery.ts';
import type { Progress } from '../progression/schema.ts';
import { spokenMasteryOf } from '../progression/spoken.ts';
import type { InputMode, WordScript } from '../settings/schema.ts';
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
	/** Read aloud: the weak kana are those of speaking (C9). */
	readonly input?: InputMode;
}

/**
 * Words of one or two kana are heard far less reliably (83 % against
 * 96 %): a spoken series keeps longer ones while there are enough (C9).
 */
export const SPOKEN_MINIMUM_KANA = 3;
/** Below this many long words, the short ones stay in. */
export const SPOKEN_MINIMUM_LONG_WORDS = 40;

function spokenEntries(
	entries: readonly VocabEntry[],
	unlocked: ReadonlySet<string>,
): readonly VocabEntry[] {
	const long = entries.filter(
		(entry) => entry.word.kana.length >= SPOKEN_MINIMUM_KANA,
	);
	const sayable = long.filter((entry) =>
		entry.units.every((kana) => unlocked.has(kana)),
	);
	return sayable.length >= SPOKEN_MINIMUM_LONG_WORDS ? long : entries;
}

function masteryScoreOf(
	progress: Progress,
	kana: string,
	rules: SelectionRules,
) {
	if (rules.input === 'voice') {
		return spokenMasteryOf(progress.spoken?.[kana]);
	}
	return masteryOf(progress.kana[kana], rules.thresholdKanaPerMinute);
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
	rules: SelectionRules,
): SelectionContext {
	const script = rules.script ?? 'both';
	const unlocked = new Set(progress.unlocked);
	const inScript = keptEntries(allEntries, script);
	const entries =
		rules.input === 'voice' ? spokenEntries(inScript, unlocked) : inScript;
	const practised = progress.unlocked.filter((kana) =>
		isInScript(kana, script),
	);
	const scored = practised.map((kana) => ({
		kana,
		mastery: masteryScoreOf(progress, kana, rules),
	}));
	const weakKana = scored
		.filter(({ mastery }) => !mastery.isMastered)
		.sort((first, second) => first.mastery.score - second.mastery.score)
		.map(({ kana }) => kana);
	return {
		entries,
		unlocked,
		featuredKana: weakKana[0] ?? practised.at(-1),
		weakKana,
	};
}
