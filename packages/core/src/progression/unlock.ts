import type { UnitAttempt } from '../stats/types.ts';
import { masteryOf } from './mastery.ts';
import { recordAttempts } from './record.ts';
import type { Progress } from './schema.ts';

export interface UnlockRules {
	/** Unlock order computed by the vocabulary pipeline. */
	readonly unlockOrder: readonly string[];
	readonly thresholdKanaPerMinute: number;
	/**
	 * Kana that appear in at least one typeable word. An unlocked kana
	 * outside this set cannot be practised yet, so it does not hold back
	 * the next unlock. Every kana is practicable when omitted.
	 */
	readonly practicableKana?: ReadonlySet<string>;
}

export interface SeriesOutcome {
	readonly progress: Progress;
	/** Kana unlocked at the end of the series, if any. */
	readonly unlockedKana: string | undefined;
}

/** Starting progress: the initial group of the unlock order. */
export function createProgress(
	unlockOrder: readonly string[],
	initialCount: number,
): Progress {
	return { unlocked: unlockOrder.slice(0, initialCount), kana: {} };
}

/**
 * Whether every unlocked kana that can be practised is mastered; kana
 * without any typeable word yet do not count (C4).
 */
export function areAllUnlockedMastered(
	progress: Progress,
	rules: Omit<UnlockRules, 'unlockOrder'>,
): boolean {
	const isPracticable = (kana: string) =>
		rules.practicableKana?.has(kana) ?? true;
	return progress.unlocked
		.filter(isPracticable)
		.every(
			(kana) =>
				masteryOf(progress.kana[kana], rules.thresholdKanaPerMinute)
					.isMastered,
		);
}

/** The next kana of the order that is not unlocked yet. */
export function nextKanaOf(
	progress: Progress,
	unlockOrder: readonly string[],
): string | undefined {
	const unlocked = new Set(progress.unlocked);
	return unlockOrder.find((kana) => !unlocked.has(kana));
}

/**
 * Records a finished series, then unlocks at most one kana, only when every
 * unlocked kana is mastered (C4).
 */
export function applySeries(
	progress: Progress,
	attempts: readonly UnitAttempt[],
	rules: UnlockRules,
): SeriesOutcome {
	const recorded = recordAttempts(progress, attempts);
	const nextKana = nextKanaOf(recorded, rules.unlockOrder);
	const canUnlock =
		nextKana !== undefined && areAllUnlockedMastered(recorded, rules);
	if (!canUnlock) {
		return { progress: recorded, unlockedKana: undefined };
	}
	return {
		progress: { ...recorded, unlocked: [...recorded.unlocked, nextKana] },
		unlockedKana: nextKana,
	};
}
