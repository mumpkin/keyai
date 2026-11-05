import {
	type Quote,
	QuotesSchema,
	type QuoteToken,
	quoteTokensOf,
} from '@keyai/core/quote';
import {
	indexVocabulary,
	type VocabEntry,
	VocabWordSchema,
} from '@keyai/core/vocab';

export interface QuoteEntry extends Quote {
	readonly tokens: readonly QuoteToken[];
}

export function quoteEntriesOf(data: unknown): QuoteEntry[] {
	return QuotesSchema.parse(data).map((quote) => ({
		...quote,
		tokens: quoteTokensOf(quote.ruby, quote.words),
	}));
}

/** Loads the quotes in their own chunk, after the app shell. */
export async function loadQuotes(): Promise<QuoteEntry[]> {
	const module = await import('@keyai/vocab/quotes.json');
	return quoteEntriesOf(module.default);
}

/**
 * The cards of the words of the quotes. They stay out of the vocabulary of
 * the series: 山巓 must not reach beginners, nor change the unlock order.
 */
export async function loadQuoteCards(): Promise<VocabEntry[]> {
	const module = await import('@keyai/vocab/quote-words.json');
	return indexVocabulary(VocabWordSchema.array().parse(module.default));
}
