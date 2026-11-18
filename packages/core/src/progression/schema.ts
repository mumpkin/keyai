import * as zod from 'zod';

export const SampleSchema = zod.object({
	/** Time spent on the unit; `null` when it was not timed. */
	ms: zod.number().nonnegative().nullable(),
	error: zod.boolean(),
});

export const KanaStatsSchema = zod.object({
	seen: zod.number().int().nonnegative(),
	errors: zod.number().int().nonnegative(),
	/** Sliding window of the most recent attempts, oldest first. */
	recent: zod.array(SampleSchema),
});

/** A word read aloud, for each of its kana (C9). */
export const SpokenSampleSchema = zod.object({
	/** Heard at the first try, not skipped. */
	firstTry: zod.boolean(),
	/** Reading time of the word divided by its kana; `null` when not timed. */
	ms: zod.number().nonnegative().nullable(),
});

export const SpokenStatsSchema = zod.object({
	seen: zod.number().int().nonnegative(),
	/** Words not heard at the first try, or skipped. */
	misses: zod.number().int().nonnegative(),
	recent: zod.array(SpokenSampleSchema),
});

export const ProgressSchema = zod.object({
	/** Unlocked kana, in unlock order. */
	unlocked: zod.array(zod.string().min(1)),
	kana: zod.record(zod.string().min(1), KanaStatsSchema),
	/**
	 * Speaking statistics, apart from typing (C9). Optional: older saves
	 * have none, and older apps still read the newer ones.
	 */
	spoken: zod.record(zod.string().min(1), SpokenStatsSchema).optional(),
});

export type Sample = zod.infer<typeof SampleSchema>;
export type KanaStats = zod.infer<typeof KanaStatsSchema>;
export type Progress = zod.infer<typeof ProgressSchema>;
export type SpokenSample = zod.infer<typeof SpokenSampleSchema>;
export type SpokenStats = zod.infer<typeof SpokenStatsSchema>;
