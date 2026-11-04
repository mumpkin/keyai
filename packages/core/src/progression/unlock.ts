import type { UnitAttempt } from '../stats/types.ts';
import { masteryOf } from './mastery.ts';
import { recordAttempts } from './record.ts';
import type { Progress } from './schema.ts';

export interface UnlockRules {
	/** Unlock order computed by the vocabulary pipeline. */
	readonly unlockOrder: readonly string[];
	readonly thresholdKanaPerMinute: number;
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

export function areAllUnlockedMastered(
	progress: Progress,
	thresholdKanaPerMinute: number,
): boolean {
	return progress.unlocked.every(
		(kana) =>
			masteryOf(progress.kana[kana], thresholdKanaPerMinute).isMastered,
	);
}

/**
 * Keeps a save consistent with the unlock order, which a new vocabulary can
 * change: the unlocked kana become the start of the order, up to the last
 * kana already unlocked. Nothing is locked again, and every unlocked kana
 * can be practised, so progress can never get stuck.
 */
export function alignProgress(
	progress: Progress,
	unlockOrder: readonly string[],
	initialCount: number,
): Progress {
	const unlocked = new Set(progress.unlocked);
	const lastIndex = unlockOrder.findLastIndex((kana) => unlocked.has(kana));
	const count = Math.max(initialCount, lastIndex + 1);
	return { ...progress, unlocked: unlockOrder.slice(0, count) };
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
 * unlocked kana is mastered and every word was typed: skipping words, even
 * by holding space, never unlocks anything (C4).
 */
export function applySeries(
	progress: Progress,
	attempts: readonly UnitAttempt[],
	rules: UnlockRules,
): SeriesOutcome {
	const recorded = recordAttempts(progress, attempts);
	const nextKana = nextKanaOf(recorded, rules.unlockOrder);
	const hasSkippedWord = attempts.some((attempt) => attempt.skipped);
	const canUnlock =
		nextKana !== undefined &&
		!hasSkippedWord &&
		areAllUnlockedMastered(recorded, rules.thresholdKanaPerMinute);
	if (!canUnlock) {
		return { progress: recorded, unlockedKana: undefined };
	}
	return {
		progress: { ...recorded, unlocked: [...recorded.unlocked, nextKana] },
		unlockedKana: nextKana,
	};
}
