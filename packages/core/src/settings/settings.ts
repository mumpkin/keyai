import {
	KANA_SIZE_LIMITS,
	LOCALES,
	type Locale,
	type Settings,
	SPEED_LIMITS,
	SPEED_PRESETS,
	WORDS_PER_SESSION_LIMITS,
} from './schema.ts';

const DEFAULT_WORDS_PER_SESSION = 20;
const DEFAULT_KANA_SIZE_PX = 24;
const FALLBACK_LOCALE: Locale = 'fr';

/**
 * First supported language among the user's preferred ones ('fr-CA' → 'fr'),
 * French otherwise (C6).
 */
export function preferredLocale(languages: readonly string[]): Locale {
	const supported = new Set<string>(LOCALES);
	const match = languages
		.map((language) => language.toLowerCase().split('-')[0] ?? '')
		.find((language) => supported.has(language));
	return (match as Locale | undefined) ?? FALLBACK_LOCALE;
}

export function defaultSettings(locale: Locale): Settings {
	return {
		locale,
		wordsPerSession: DEFAULT_WORDS_PER_SESSION,
		speed: { preset: 'easy', kanaPerMinute: SPEED_PRESETS.easy },
		feedback: { sound: false },
		display: { kanaSizePx: DEFAULT_KANA_SIZE_PX },
	};
}

function clamp(value: number, limits: { min: number; max: number }): number {
	return Math.min(limits.max, Math.max(limits.min, value));
}

export function withLocale(settings: Settings, locale: Locale): Settings {
	return { ...settings, locale };
}

export function withErrorSound(settings: Settings, sound: boolean): Settings {
	return { ...settings, feedback: { sound } };
}

export function withSpeedPreset(
	settings: Settings,
	preset: keyof typeof SPEED_PRESETS,
): Settings {
	return {
		...settings,
		speed: { preset, kanaPerMinute: SPEED_PRESETS[preset] },
	};
}

/** A value typed by the user switches the preset to custom (C6). */
export function withKanaPerMinute(
	settings: Settings,
	kanaPerMinute: number,
): Settings {
	const stepped =
		Math.round(kanaPerMinute / SPEED_LIMITS.step) * SPEED_LIMITS.step;
	return {
		...settings,
		speed: {
			preset: 'custom',
			kanaPerMinute: clamp(stepped, SPEED_LIMITS),
		},
	};
}

export function withWordsPerSession(
	settings: Settings,
	wordsPerSession: number,
): Settings {
	return {
		...settings,
		wordsPerSession: clamp(
			Math.round(wordsPerSession),
			WORDS_PER_SESSION_LIMITS,
		),
	};
}

export function withKanaSize(settings: Settings, kanaSizePx: number): Settings {
	return {
		...settings,
		display: {
			kanaSizePx: clamp(Math.round(kanaSizePx), KANA_SIZE_LIMITS),
		},
	};
}
