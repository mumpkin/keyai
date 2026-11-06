const NEW_ISSUE_URL = 'https://github.com/mumpkin/keyai/issues/new';

interface ReportContext {
	readonly version: string;
	readonly platform: 'web' | 'tauri';
	readonly userAgent: string;
}

function deviceOf({ platform, userAgent }: ReportContext): string {
	return platform === 'web' ? `Web, ${userAgent}` : `Desktop, ${userAgent}`;
}

/** Opens the bug form with what a reporter would have to look for. */
export function bugReportUrl(context: ReportContext): string {
	const parameters = new URLSearchParams({
		template: 'bug.yml',
		version: context.version,
		platform: deviceOf(context),
	});
	return `${NEW_ISSUE_URL}?${parameters}`;
}
