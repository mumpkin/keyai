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
	withKanaPerMinute,
	withKanaSize,
	withSpeedPreset,
	withWordsPerSession,
} from './settings.ts';
