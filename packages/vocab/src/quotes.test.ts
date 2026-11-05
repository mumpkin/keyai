import { readFileSync } from 'node:fs';
import { isTypeable, tokenize } from '@keyai/core/input';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Quote {
	readonly id: string;
	readonly author: string;
	readonly authorLatin: string;
	readonly work: string;
	readonly year: number;
	readonly source: string;
	readonly text: string;
	readonly ruby: string;
	readonly fr: string;
	readonly en: string;
}

const QUOTES: Quote[] = parse(
	readFileSync(new URL('../quotes/quotes.yaml', import.meta.url), 'utf8'),
);

const QUOTE_COUNT = 100;
const LATEST_DEATH_YEAR = 1955;
const PUNCTUATION = /[、。！？「」『』\s]/g;

function textOf(ruby: string): string {
	return ruby
		.replace(/\[([^|]+)\|[^\]]+\]/g, '$1')
		.replace(/[{}]/g, '')
		.replaceAll(' ', '');
}

function readingOf(ruby: string): string {
	return ruby
		.replace(/\[[^|]+\|([^\]]+)\]/g, '$1')
		.replace(/[{}]/g, '')
		.replace(PUNCTUATION, '');
}

describe('quotes', () => {
	it('has every quote once', () => {
		expect(QUOTES).toHaveLength(QUOTE_COUNT);
		expect(new Set(QUOTES.map((quote) => quote.id)).size).toBe(QUOTE_COUNT);
		expect(new Set(QUOTES.map((quote) => quote.text)).size).toBe(
			QUOTE_COUNT,
		);
	});

	it.each(QUOTES)('$id gives its source and translations', (quote) => {
		expect(quote.author).not.toBe('');
		expect(quote.authorLatin).not.toBe('');
		expect(quote.work).not.toBe('');
		expect(quote.year).toBeLessThan(LATEST_DEATH_YEAR);
		expect(quote.source).toMatch(/^https:\/\/www\.aozora\.gr\.jp\/cards\//);
		expect(quote.fr).not.toBe('');
		expect(quote.en).not.toBe('');
	});

	it.each(QUOTES)(
		'$id has readings that match its text',
		({ text, ruby }) => {
			expect(textOf(ruby)).toBe(text.replaceAll(' ', ''));
		},
	);

	it.each(QUOTES)('$id can be typed', ({ ruby }) => {
		expect(isTypeable(tokenize(readingOf(ruby)))).toBe(true);
	});
});
