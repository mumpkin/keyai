import {
	DEFAULT_QUOTE_HINT,
	KANA_SIZE_LIMITS,
	type KanaTableTab,
	LOCALES,
	type Locale,
	type Settings,
	SPEED_LIMITS,
	SPEED_PRESETS,
	type Theme,
	type TrainingMode,
	WORDS_PER_SESSION_LIMITS,
	type WordScript,
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
		naturalWriting: true,
		keepsWordSpaces: true,
		wordScript: 'both',
		trainingMode: 'words',
		quote: {
			length: 'all',
			keepsSpaces: false,
			display: 'kana',
			typesPunctuation: false,
			hintAfterErrors: DEFAULT_QUOTE_HINT,
		},
		feedback: { sound: false },
		display: {
			kanaSizePx: DEFAULT_KANA_SIZE_PX,
			theme: 'system',
			showsSupportButton: true,
			kanaTableTab: 'mine',
		},
	};
}

function clamp(value: number, limits: { min: number; max: number }): number {
	return Math.min(limits.max, Math.max(limits.min, value));
}

export function withLocale(settings: Settings, locale: Locale): Settings {
	return { ...settings, locale };
}

export function withNaturalWriting(
	settings: Settings,
	naturalWriting: boolean,
): Settings {
	return { ...settings, naturalWriting };
}

export function withWordSpaces(
	settings: Settings,
	keepsWordSpaces: boolean,
): Settings {
	return { ...settings, keepsWordSpaces };
}

export function withTrainingMode(
	settings: Settings,
	trainingMode: TrainingMode,
): Settings {
	return { ...settings, trainingMode };
}

export function withWordScript(
	settings: Settings,
	wordScript: WordScript,
): Settings {
	return { ...settings, wordScript };
}

export function withQuote(
	settings: Settings,
	quote: Partial<Settings['quote']>,
): Settings {
	return { ...settings, quote: { ...settings.quote, ...quote } };
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
			...settings.display,
			kanaSizePx: clamp(Math.round(kanaSizePx), KANA_SIZE_LIMITS),
		},
	};
}

export function withTheme(settings: Settings, theme: Theme): Settings {
	return { ...settings, display: { ...settings.display, theme } };
}

export function withSupportButton(
	settings: Settings,
	showsSupportButton: boolean,
): Settings {
	return {
		...settings,
		display: { ...settings.display, showsSupportButton },
	};
}

export function withKanaTableTab(
	settings: Settings,
	kanaTableTab: KanaTableTab,
): Settings {
	return { ...settings, display: { ...settings.display, kanaTableTab } };
}
