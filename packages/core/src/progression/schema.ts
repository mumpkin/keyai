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

export const ProgressSchema = zod.object({
	/** Unlocked kana, in unlock order. */
	unlocked: zod.array(zod.string().min(1)),
	kana: zod.record(zod.string().min(1), KanaStatsSchema),
});

export type Sample = zod.infer<typeof SampleSchema>;
export type KanaStats = zod.infer<typeof KanaStatsSchema>;
export type Progress = zod.infer<typeof ProgressSchema>;
