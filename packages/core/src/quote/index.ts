export {
	type QuoteMark,
	type QuotePiece,
	type QuoteToken,
	type QuoteWord,
	quoteInKana,
	quoteKanaCountOf,
	quoteSeriesOf,
	quoteTokensOf,
	quoteWordsOf,
	withTypedMarks,
} from './parse.ts';
export { type Quote, QuoteSchema, QuotesSchema } from './schema.ts';
export {
	nextQuoteOf,
	type QuoteChoice,
	quotesOfLength,
} from './select.ts';
