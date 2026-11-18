import { ATTEMPT_WINDOW, MINIMUM_ATTEMPTS } from './mastery.ts';
import type { Progress, SpokenStats } from './schema.ts';

/**
 * Words heard at the first try needed to master a kana by speaking: lower
 * than the 90 % of typing, as the recognizer refuses about one word said
 * right in ten (C9).
 */
export const SPOKEN_REQUIRED_RATIO = 0.8;

/** A word of a spoken series, as the series ended it. */
export interface SpokenWord {
	/** Kana of the units of the word ('きゃく' → ['きゃ', 'く']). */
	readonly units: readonly string[];
	readonly heardFirstTry: boolean;
	readonly skipped: boolean;
	/** From the word being ready to the end of the voice, first try only. */
	readonly readingMs: number | null;
}

export interface SpokenMastery {
	readonly isMastered: boolean;
	/** From 0 to 1, for display. */
	readonly score: number;
	readonly firstTryRatio: number;
}

const EMPTY_STATS: SpokenStats = { seen: 0, misses: 0, recent: [] };

/**
 * Mastery by speaking, from the last words said that contain the kana.
 * The reading speed will join it once its threshold is measured (C9).
 */
export function spokenMasteryOf(stats: SpokenStats | undefined): SpokenMastery {
	const samples = stats?.recent.slice(-ATTEMPT_WINDOW) ?? [];
	if (samples.length === 0) {
		return { isMastered: false, score: 0, firstTryRatio: 0 };
	}
	const firstTryRatio =
		samples.filter((sample) => sample.firstTry).length / samples.length;
	return {
		isMastered:
			samples.length >= MINIMUM_ATTEMPTS &&
			firstTryRatio >= SPOKEN_REQUIRED_RATIO,
		score: Math.min(1, firstTryRatio / SPOKEN_REQUIRED_RATIO),
		firstTryRatio,
	};
}

function withWord(stats: SpokenStats, word: SpokenWord): SpokenStats {
	const firstTry = word.heardFirstTry && !word.skipped;
	const ms =
		word.readingMs === null ? null : word.readingMs / word.units.length;
	return {
		seen: stats.seen + 1,
		misses: stats.misses + (firstTry ? 0 : 1),
		recent: [...stats.recent, { firstTry, ms }].slice(-ATTEMPT_WINDOW),
	};
}

/** Adds the words of a spoken series to the speaking statistics. */
export function recordSpokenWords(
	progress: Progress,
	words: readonly SpokenWord[],
): Progress {
	const spoken = { ...progress.spoken };
	for (const word of words) {
		for (const kana of new Set(word.units)) {
			spoken[kana] = withWord(spoken[kana] ?? EMPTY_STATS, word);
		}
	}
	return { ...progress, spoken };
}
