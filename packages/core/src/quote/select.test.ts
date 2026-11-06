import { describe, expect, it } from 'vitest';
import { createRandom } from '../random/random.ts';
import { quoteTokensOf } from './parse.ts';
import { nextQuoteOf, quotesOfLength } from './select.ts';

function quoteOf(id: string, kanaCount: number) {
	return { id, tokens: quoteTokensOf('あ'.repeat(kanaCount)) };
}

const SHORT = quoteOf('short', 20);
const MEDIUM = quoteOf('medium', 21);
const LONG = quoteOf('long', 36);
const QUOTES = [SHORT, MEDIUM, LONG];

describe('quotesOfLength', () => {
	it('keeps everything for all lengths', () => {
		expect(quotesOfLength(QUOTES, 'all')).toEqual(QUOTES);
	});

	it.each([
		['short', SHORT],
		['medium', MEDIUM],
		['long', LONG],
	] as const)('sorts a quote as %s', (length, quote) => {
		expect(quotesOfLength(QUOTES, length)).toEqual([quote]);
	});
});

describe('nextQuoteOf', () => {
	const random = createRandom(1);

	it('draws a quote not seen yet', () => {
		const seen = new Set(['short', 'medium']);
		expect(nextQuoteOf(QUOTES, { length: 'all', seen }, random)).toBe(LONG);
	});

	it('stays within the length', () => {
		const seen = new Set<string>();
		expect(nextQuoteOf(QUOTES, { length: 'long', seen }, random)).toBe(
			LONG,
		);
	});

	it('starts again once all were seen', () => {
		const seen = new Set(['short', 'medium', 'long']);
		const quote = nextQuoteOf(QUOTES, { length: 'all', seen }, random);
		expect(QUOTES).toContain(quote);
	});
});
