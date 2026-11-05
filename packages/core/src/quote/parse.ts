import type { WordTyping } from '../session/types.ts';

/** Part of a word: kana, or kanji with their reading. */
export interface QuotePiece {
	readonly text: string;
	readonly reading?: string;
}

export interface QuoteWord {
	readonly kind: 'word';
	readonly pieces: readonly QuotePiece[];
	/** Kana to type. */
	readonly reading: string;
	readonly isParticle: boolean;
	/** Id of its word card, if it has one. */
	readonly cardId?: string;
	/** A punctuation mark that must be typed, by these keys. */
	readonly keys?: readonly string[];
}

/** Punctuation: shown, not typed. */
export interface QuoteMark {
	readonly kind: 'mark';
	readonly text: string;
}

export type QuoteToken = QuoteWord | QuoteMark;

const MARK = /^[、。！？「」『』]+$/;
const PIECE = /\[([^|\]]+)\|([^\]]+)\]|([^[\]]+)/g;
const PARTICLE = /^\{(.)\}$/;

/** Spoken readings of the particles, which the writing does not show. */
const PARTICLE_SPELLINGS: ReadonlyMap<string, string> = new Map([
	['は', 'wa'],
	['へ', 'e'],
]);

function piecesOf(token: string): QuotePiece[] {
	return [...token.matchAll(PIECE)].map(([, kanji, reading, kana]) =>
		kanji && reading ? { text: kanji, reading } : { text: kana ?? '' },
	);
}

function tokenOf(token: string): QuoteToken {
	if (MARK.test(token)) {
		return { kind: 'mark', text: token };
	}
	const particle = PARTICLE.exec(token)?.[1];
	const pieces = particle ? [{ text: particle }] : piecesOf(token);
	return {
		kind: 'word',
		pieces,
		reading: pieces.map((piece) => piece.reading ?? piece.text).join(''),
		isParticle: particle !== undefined,
	};
}

/** `cardIds` gives the card of each word, in order, without the marks. */
export function quoteTokensOf(
	ruby: string,
	cardIds: readonly (string | null)[] = [],
): QuoteToken[] {
	let wordIndex = 0;
	return ruby
		.split(' ')
		.map(tokenOf)
		.map((token) => {
			if (token.kind === 'mark') {
				return token;
			}
			const cardId = cardIds[wordIndex] ?? undefined;
			wordIndex += 1;
			return cardId ? { ...token, cardId } : token;
		});
}

export function quoteWordsOf(tokens: readonly QuoteToken[]): QuoteWord[] {
	return tokens.filter((token) => token.kind === 'word');
}

function typingOf(word: QuoteWord, next: QuoteWord | undefined): WordTyping {
	if (word.keys) {
		return { keys: word.keys };
	}
	const spelling = word.isParticle
		? PARTICLE_SPELLINGS.get(word.reading)
		: undefined;
	return {
		...(spelling ? { alternatives: [spelling] } : {}),
		...(next && !next.keys ? { following: next.reading } : {}),
	};
}

/** Keys of the marks: those of a Japanese keyboard, without the input method. */
const MARK_KEYS: ReadonlyMap<string, readonly string[]> = new Map([
	['、', [',']],
	['。', ['.']],
	['！', ['!']],
	['？', ['?']],
	['「', ['[']],
	['」', [']']],
	['『', ['[']],
	['』', [']']],
]);

function typedMark({ text }: QuoteMark): QuoteWord {
	return {
		kind: 'word',
		pieces: [{ text }],
		reading: text,
		isParticle: false,
		keys: MARK_KEYS.get(text) ?? [],
	};
}

/** Punctuation becomes words of their own, for those who want to type it. */
export function withTypedMarks(tokens: readonly QuoteToken[]): QuoteWord[] {
	return tokens.map((token) =>
		token.kind === 'mark' ? typedMark(token) : token,
	);
}

/** What a series needs to type a quote. */
export function quoteSeriesOf(tokens: readonly QuoteToken[]) {
	const words = quoteWordsOf(tokens);
	return {
		words: words.map((word) => word.reading),
		typing: words.map((word, index) => typingOf(word, words[index + 1])),
	};
}

/** Kana to type, which tells how long a quote is. */
export function quoteKanaCountOf(tokens: readonly QuoteToken[]): number {
	return quoteWordsOf(tokens).reduce(
		(count, word) => count + word.reading.length,
		0,
	);
}
