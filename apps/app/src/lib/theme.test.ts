import { describe, expect, it } from 'vitest';
import { isDarkTheme } from './theme.ts';

describe('isDarkTheme', () => {
	it.each([
		['system', true, true],
		['system', false, false],
		['dark', false, true],
		['light', true, false],
	] as const)('%s with a dark system: %s', (theme, isSystemDark, isDark) => {
		expect(isDarkTheme(theme, isSystemDark)).toBe(isDark);
	});
});
