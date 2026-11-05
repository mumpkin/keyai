import { readFileSync } from 'node:fs';
import { toHepburn, tokenize } from '@keyai/core/input';
import {
	QuotesSchema,
	quoteSeriesOf,
	quoteTokensOf,
	quoteWordsOf,
} from '@keyai/core/quote';
import { createSeries, seriesReducer } from '@keyai/core/session';
import { indexVocabulary, VocabWordSchema } from '@keyai/core/vocab';
import { describe, expect, it } from 'vitest';
import * as zod from 'zod';

const QUOTES = QuotesSchema.parse(
	JSON.parse(
		readFileSync(new URL('../data/quotes.json', import.meta.url), 'utf8'),
	),
);

const QUOTE_COUNT = 100;
const LATEST_DEATH_YEAR = 1955;

function textOf(ruby: string): string {
	return ruby
		.replace(/\[([^|]+)\|[^\]]+\]/g, '$1')
		.replace(/[{}]/g, '')
		.replaceAll(' ', '');
}

/** Types the whole quote from its romaji, as a sentence and not word by word. */
function playedFromRomaji(ruby: string) {
	const { words, typing } = quoteSeriesOf(quoteTokensOf(ruby));
	const romaji = toHepburn(tokenize(words.join('')));
	return [...romaji].reduce(
		(state, key, index) =>
			seriesReducer(state, { type: 'key', key, at: index }),
		createSeries(words, { naturalWriting: true, typing }),
	);
}

const CARDS = indexVocabulary(
	zod
		.array(VocabWordSchema)
		.parse(
			JSON.parse(
				readFileSync(
					new URL('../data/quote-words.json', import.meta.url),
					'utf8',
				),
			),
		),
);
const CARD_IDS = new Set(CARDS.map((entry) => entry.word.id));

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

	it.each(QUOTES)('$id can be typed from start to end', ({ ruby }) => {
		const state = playedFromRomaji(ruby);
		expect(state.phase).toBe('finished');
		expect(state.wrongKeyCount).toBe(0);
	});

	it.each(QUOTES)(
		'$id has a usable card for each word',
		({ ruby, words }) => {
			const tokens = quoteWordsOf(quoteTokensOf(ruby, words));
			expect(words).toHaveLength(tokens.length);
			for (const { cardId } of tokens) {
				expect(CARD_IDS.has(cardId ?? '')).toBe(true);
			}
		},
	);
});
