import type { UnitAttempt } from '../stats/types.ts';
import { ATTEMPT_WINDOW } from './mastery.ts';
import type { KanaStats, Progress } from './schema.ts';

const EMPTY_STATS: KanaStats = { seen: 0, errors: 0, recent: [] };

function withAttempt(stats: KanaStats, attempt: UnitAttempt): KanaStats {
	const isFaulty = attempt.hadError || attempt.skipped;
	const sample = { ms: attempt.durationMs, error: isFaulty };
	return {
		seen: stats.seen + 1,
		errors: stats.errors + (isFaulty ? 1 : 0),
		recent: [...stats.recent, sample].slice(-ATTEMPT_WINDOW),
	};
}

/** Adds the attempts of a series to the per-kana statistics. */
export function recordAttempts(
	progress: Progress,
	attempts: readonly UnitAttempt[],
): Progress {
	const kana = { ...progress.kana };
	for (const attempt of attempts) {
		kana[attempt.kana] = withAttempt(
			kana[attempt.kana] ?? EMPTY_STATS,
			attempt,
		);
	}
	return { ...progress, kana };
}
