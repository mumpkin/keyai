import { describe, expect, it } from 'vitest';
import { SettingsSchema } from './schema.ts';
import {
	defaultSettings,
	preferredLocale,
	withErrorSound,
	withKanaPerMinute,
	withKanaSize,
	withLocale,
	withSpeedPreset,
	withTheme,
	withWordsPerSession,
} from './settings.ts';

const DEFAULTS = defaultSettings('fr');

describe('settings', () => {
	it('uses the defaults of C6 and C8', () => {
		expect(DEFAULTS).toEqual({
			locale: 'fr',
			wordsPerSession: 20,
			speed: { preset: 'easy', kanaPerMinute: 30 },
			feedback: { sound: false },
			display: { kanaSizePx: 24, theme: 'system' },
		});
		expect(SettingsSchema.parse(DEFAULTS)).toEqual(DEFAULTS);
	});

	it.each([
		[['fr-FR', 'en'], 'fr'],
		[['en-US'], 'en'],
		[['de-DE', 'en-GB'], 'en'],
		[['ja'], 'fr'],
		[[], 'fr'],
	] as const)('picks the locale from %j', (languages, locale) => {
		expect(preferredLocale(languages)).toBe(locale);
	});

	it('keeps the theme and the kana size apart', () => {
		const dark = withTheme(DEFAULTS, 'dark');
		expect(dark.display.theme).toBe('dark');
		expect(withKanaSize(dark, 40).display).toEqual({
			kanaSizePx: 40,
			theme: 'dark',
		});
	});

	it('changes the locale', () => {
		expect(withLocale(DEFAULTS, 'en').locale).toBe('en');
	});

	it('switches the error sound', () => {
		expect(withErrorSound(DEFAULTS, true).feedback).toEqual({
			sound: true,
		});
	});

	it('applies a speed preset', () => {
		expect(withSpeedPreset(DEFAULTS, 'hard').speed).toEqual({
			preset: 'hard',
			kanaPerMinute: 60,
		});
	});

	it('switches to custom when the speed is edited, within limits', () => {
		const edited = withSpeedPreset(DEFAULTS, 'normal');
		expect(withKanaPerMinute(edited, 47).speed).toEqual({
			preset: 'custom',
			kanaPerMinute: 45,
		});
		expect(withKanaPerMinute(edited, 500).speed.kanaPerMinute).toBe(150);
		expect(withKanaPerMinute(edited, 2).speed.kanaPerMinute).toBe(10);
	});

	it('keeps words per session and kana size within limits', () => {
		expect(withWordsPerSession(DEFAULTS, 50).wordsPerSession).toBe(50);
		expect(withWordsPerSession(DEFAULTS, 1000).wordsPerSession).toBe(100);
		expect(withKanaSize(DEFAULTS, 40).display.kanaSizePx).toBe(40);
		expect(withKanaSize(DEFAULTS, 8).display.kanaSizePx).toBe(16);
	});

	it('rejects settings out of range', () => {
		const invalid = {
			...DEFAULTS,
			speed: { preset: 'easy', kanaPerMinute: 33 },
		};
		expect(SettingsSchema.safeParse(invalid).success).toBe(false);
	});
});
