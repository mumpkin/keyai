const NEW_ISSUE_URL = 'https://github.com/mumpkin/keyai/issues/new';

interface ReportedWord {
	readonly kana: string;
	readonly translation: string;
}

/** Opens the issue form of a translation error, already filled in. */
export function translationReportUrl(word?: ReportedWord): string {
	const parameters = new URLSearchParams({ template: 'translation.yml' });
	if (word) {
		parameters.set('title', `Traduction de ${word.kana}`);
		parameters.set('word', word.kana);
		parameters.set('current', word.translation);
	}
	return `${NEW_ISSUE_URL}?${parameters}`;
}
