import { kanaPerMinuteOf } from '../stats/measure.ts';
import type { KanaStats, Sample } from './schema.ts';

/** Attempts kept per kana and used to judge mastery (C4). */
export const ATTEMPT_WINDOW = 10;
export const MINIMUM_ATTEMPTS = 5;
export const REQUIRED_CLEAN_RATIO = 0.9;

export interface Mastery {
	readonly isMastered: boolean;
	/** From 0 to 1, for display: the weaker of speed and accuracy. */
	readonly score: number;
	readonly medianKanaPerMinute: number;
	readonly cleanRatio: number;
}

const NO_MASTERY: Mastery = {
	isMastered: false,
	score: 0,
	medianKanaPerMinute: 0,
	cleanRatio: 0,
};

export function median(values: readonly number[]): number {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((first, second) => first - second);
	const middle = Math.floor(sorted.length / 2);
	const middleValues =
		sorted.length % 2 === 1
			? sorted.slice(middle, middle + 1)
			: sorted.slice(middle - 1, middle + 1);
	const sum = middleValues.reduce((total, value) => total + value, 0);
	return sum / middleValues.length;
}

function timedSpeeds(samples: readonly Sample[]): number[] {
	return samples
		.map((sample) => sample.ms)
		.filter((ms) => ms !== null)
		.map(kanaPerMinuteOf);
}

function isAccurateEnough(samples: readonly Sample[], cleanRatio: number) {
	return samples.length < ATTEMPT_WINDOW
		? cleanRatio === 1
		: cleanRatio >= REQUIRED_CLEAN_RATIO;
}

/**
 * Mastery of a kana from its last attempts, against the user's speed
 * threshold in kana per minute. Never stored: always recomputed.
 */
export function masteryOf(
	stats: KanaStats | undefined,
	thresholdKanaPerMinute: number,
): Mastery {
	const samples = stats?.recent.slice(-ATTEMPT_WINDOW) ?? [];
	const speeds = timedSpeeds(samples);
	if (samples.length === 0 || speeds.length === 0) {
		return NO_MASTERY;
	}
	const medianKanaPerMinute = median(speeds);
	const cleanRatio =
		samples.filter((sample) => !sample.error).length / samples.length;
	const isMastered =
		samples.length >= MINIMUM_ATTEMPTS &&
		medianKanaPerMinute >= thresholdKanaPerMinute &&
		isAccurateEnough(samples, cleanRatio);
	const score = Math.min(
		1,
		medianKanaPerMinute / thresholdKanaPerMinute,
		cleanRatio / REQUIRED_CLEAN_RATIO,
	);
	return { isMastered, score, medianKanaPerMinute, cleanRatio };
}
