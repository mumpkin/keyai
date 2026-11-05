import type { QuoteToken } from './parse.ts';

/** The whole quote in kana, as read: 人生 becomes じんせい. */
export function quoteInKana(tokens: readonly QuoteToken[]): QuoteToken[] {
	return tokens.map((token) =>
		token.kind === 'word'
			? { ...token, pieces: [{ text: token.reading }] }
			: token,
	);
}
