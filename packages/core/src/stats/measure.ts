import type {
	FaultyKana,
	KanaSpeed,
	SeriesMeasurements,
	SeriesRecord,
	UnitAttempt,
} from './types.ts';

export const MS_PER_MINUTE = 60_000;
const SHOWN_FAULTY_KANA = 5;

/** Speed of a single timed attempt, in kana per minute. */
export function kanaPerMinuteOf(durationMs: number): number {
	return durationMs > 0 ? MS_PER_MINUTE / durationMs : 0;
}

function isClean(attempt: UnitAttempt): boolean {
	return !(attempt.hadError || attempt.skipped);
}

function faultyKanaOf(attempts: readonly UnitAttempt[]): FaultyKana[] {
	const counts = new Map<string, number>();
	for (const attempt of attempts.filter((item) => !isClean(item))) {
		counts.set(attempt.kana, (counts.get(attempt.kana) ?? 0) + 1);
	}
	return [...counts]
		.map(([kana, faultyAttempts]) => ({ kana, faultyAttempts }))
		.sort((first, second) => second.faultyAttempts - first.faultyAttempts)
		.slice(0, SHOWN_FAULTY_KANA);
}

/**
 * Speed of each word of a series, from its timed units; `null` for a word
 * without any, such as a word skipped at once.
 */
export function wordSpeedsOf(
	attempts: readonly UnitAttempt[],
	wordCount: number,
): (number | null)[] {
	return Array.from({ length: wordCount }, (_unused, wordIndex) =>
		speedOf(attempts.filter((attempt) => attempt.wordIndex === wordIndex)),
	);
}

function speedOf(attempts: readonly UnitAttempt[]): number | null {
	const durations = attempts.flatMap((attempt) =>
		attempt.skipped || attempt.durationMs === null
			? []
			: [attempt.durationMs],
	);
	const totalMs = durations.reduce((sum, ms) => sum + ms, 0);
	return totalMs > 0 ? (durations.length * MS_PER_MINUTE) / totalMs : null;
}

/** Speed and accuracy of each timed kana of a series, the slowest first. */
export function kanaSpeedsOf(attempts: readonly UnitAttempt[]): KanaSpeed[] {
	const byKana = Map.groupBy(attempts, (attempt) => attempt.kana);
	return [...byKana]
		.flatMap(([kana, kanaAttempts]) => {
			const kanaPerMinute = speedOf(kanaAttempts);
			const clean = kanaAttempts.filter(isClean).length;
			return kanaPerMinute === null
				? []
				: [
						{
							kana,
							kanaPerMinute,
							accuracy: clean / kanaAttempts.length,
						},
					];
		})
		.sort((first, second) => first.kanaPerMinute - second.kanaPerMinute);
}

/** Measurements of a finished series (see functional design, C3). */
export function measureSeries(record: SeriesRecord): SeriesMeasurements {
	const { attempts, elapsedMs } = record;
	const completed = attempts.filter((attempt) => !attempt.skipped).length;
	const clean = attempts.filter(isClean).length;
	return {
		kanaPerMinute:
			elapsedMs > 0 ? (completed * MS_PER_MINUTE) / elapsedMs : 0,
		accuracy: attempts.length > 0 ? clean / attempts.length : 0,
		errorCount: record.wrongKeyCount,
		faultyKana: faultyKanaOf(attempts),
	};
}
