export { cn } from 'cn';

/** The tour needs the full table and a mouse: phones go without it. */
export function isDesktopSize(): boolean {
	return window.matchMedia('(min-width: 48rem)').matches;
}
