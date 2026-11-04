import type { UnitAttempt } from '../stats/types.ts';
import type { KanaStats, Sample } from './schema.ts';

/** 1 second per kana: 60 kana per minute. */
export const ONE_SECOND = 1000;

export function samples(count: number, sample: Sample): Sample[] {
	return Array.from({ length: count }, () => sample);
}

export function statsOf(recent: Sample[]): KanaStats {
	return {
		seen: recent.length,
		errors: recent.filter((sample) => sample.error).length,
		recent,
	};
}

export function cleanAttempts(kana: string, count: number): UnitAttempt[] {
	return Array.from({ length: count }, () => ({
		wordIndex: 0,
		kana,
		durationMs: ONE_SECOND,
		hadError: false,
		skipped: false,
	}));
}
