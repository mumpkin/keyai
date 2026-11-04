import type { Theme } from '@keyai/core/settings';

export function isDarkTheme(theme: Theme, isSystemDark: boolean): boolean {
	return theme === 'dark' || (theme === 'system' && isSystemDark);
}

/** The browser bar of a phone follows the theme too. */
export function applyTheme(isDark: boolean): void {
	const root = document.documentElement;
	root.classList.toggle('dark', isDark);
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute(
			'content',
			getComputedStyle(root).getPropertyValue('--background'),
		);
}
