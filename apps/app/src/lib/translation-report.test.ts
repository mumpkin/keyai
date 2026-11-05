import { describe, expect, it } from 'vitest';
import { translationReportUrl } from './translation-report.ts';

describe('translationReportUrl', () => {
	it('fills the form in with the word', () => {
		const url = new URL(
			translationReportUrl({ kana: 'かも', translation: 'peut-être' }),
		);
		expect(url.searchParams.get('template')).toBe('translation.yml');
		expect(url.searchParams.get('word')).toBe('かも');
		expect(url.searchParams.get('current')).toBe('peut-être');
	});

	it('opens an empty form without a word', () => {
		const url = new URL(translationReportUrl());
		expect(url.searchParams.get('word')).toBeNull();
	});
});
