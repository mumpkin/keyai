import type { Theme } from '@keyai/core/settings';

export function isDarkTheme(theme: Theme, isSystemDark: boolean): boolean {
	return theme === 'dark' || (theme === 'system' && isSystemDark);
}
