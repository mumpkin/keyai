export {
	KANA_SIZE_LIMITS,
	LOCALES,
	type Locale,
	type Settings,
	SettingsSchema,
	SPEED_LIMITS,
	SPEED_PRESET_NAMES,
	SPEED_PRESETS,
	type SpeedPresetName,
	WORDS_PER_SESSION_LIMITS,
} from './schema.ts';
export {
	defaultSettings,
	preferredLocale,
	withErrorSound,
	withKanaPerMinute,
	withKanaSize,
	withLocale,
	withSpeedPreset,
	withWordsPerSession,
} from './settings.ts';
