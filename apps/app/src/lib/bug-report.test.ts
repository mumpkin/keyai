import { describe, expect, it } from 'vitest';
import { bugReportUrl } from './bug-report.ts';

describe('bugReportUrl', () => {
	it('fills the version and the device in', () => {
		const url = new URL(
			bugReportUrl({
				version: '0.5.0',
				platform: 'web',
				userAgent: 'Firefox',
			}),
		);
		expect(url.searchParams.get('template')).toBe('bug.yml');
		expect(url.searchParams.get('version')).toBe('0.5.0');
		expect(url.searchParams.get('platform')).toBe('Web, Firefox');
	});

	it('tells the desktop app apart', () => {
		const url = new URL(
			bugReportUrl({
				version: '0.5.0',
				platform: 'tauri',
				userAgent: 'WebKit',
			}),
		);
		expect(url.searchParams.get('platform')).toBe('Desktop, WebKit');
	});
});
