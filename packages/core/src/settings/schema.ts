import * as zod from 'zod';

export const LOCALES = ['fr', 'en'] as const;
export const THEMES = ['system', 'dark', 'light'] as const;
export const SPEED_PRESET_NAMES = ['easy', 'normal', 'hard', 'custom'] as const;

/** Speed thresholds in kana per minute (C6). */
export const SPEED_PRESETS = { easy: 30, normal: 45, hard: 60 } as const;

export const SPEED_LIMITS = { min: 10, max: 150, step: 5 } as const;
export const WORDS_PER_SESSION_LIMITS = { min: 5, max: 100 } as const;
export const KANA_SIZE_LIMITS = { min: 16, max: 64 } as const;

export const SettingsSchema = zod.object({
	locale: zod.enum(LOCALES),
	wordsPerSession: zod
		.number()
		.int()
		.min(WORDS_PER_SESSION_LIMITS.min)
		.max(WORDS_PER_SESSION_LIMITS.max),
	speed: zod.object({
		preset: zod.enum(SPEED_PRESET_NAMES),
		kanaPerMinute: zod
			.number()
			.int()
			.min(SPEED_LIMITS.min)
			.max(SPEED_LIMITS.max)
			.multipleOf(SPEED_LIMITS.step),
	}),
	feedback: zod.object({ sound: zod.boolean() }),
	display: zod.object({
		kanaSizePx: zod
			.number()
			.int()
			.min(KANA_SIZE_LIMITS.min)
			.max(KANA_SIZE_LIMITS.max),
		theme: zod.enum(THEMES),
	}),
});

export type Locale = (typeof LOCALES)[number];
export type Theme = (typeof THEMES)[number];
export type SpeedPresetName = (typeof SPEED_PRESET_NAMES)[number];
export type Settings = zod.infer<typeof SettingsSchema>;
