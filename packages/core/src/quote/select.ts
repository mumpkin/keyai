import type { Random } from '../random/random.ts';
import { pickWeighted } from '../random/random.ts';
import type { QuoteLength } from '../settings/schema.ts';
import type { QuoteToken } from './parse.ts';
import { quoteKanaCountOf } from './parse.ts';

const SHORT_MAXIMUM = 20;
const MEDIUM_MAXIMUM = 35;

export interface QuoteChoice {
	readonly id: string;
	readonly tokens: readonly QuoteToken[];
}

function lengthOf(tokens: readonly QuoteToken[]): QuoteLength {
	const count = quoteKanaCountOf(tokens);
	if (count <= SHORT_MAXIMUM) {
		return 'short';
	}
	return count <= MEDIUM_MAXIMUM ? 'medium' : 'long';
}

export function quotesOfLength<Item extends QuoteChoice>(
	quotes: readonly Item[],
	length: QuoteLength,
): Item[] {
	return length === 'all'
		? [...quotes]
		: quotes.filter((quote) => lengthOf(quote.tokens) === length);
}

/** A quote not seen yet of that length; once all were seen, any of them. */
export function nextQuoteOf<Item extends QuoteChoice>(
	quotes: readonly Item[],
	choice: {
		readonly length: QuoteLength;
		readonly seen: ReadonlySet<string>;
	},
	random: Random,
): Item {
	const eligible = quotesOfLength(quotes, choice.length);
	const unseen = eligible.filter((quote) => !choice.seen.has(quote.id));
	const candidates = unseen.length > 0 ? unseen : eligible;
	return pickWeighted(candidates, () => 1, random) as Item;
}
