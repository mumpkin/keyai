import type { QuotePiece, QuoteToken, QuoteWord } from '@keyai/core/quote';
import type { UnitView } from '@/features/training/series/series-view.ts';

/** A word with the punctuation around it, which must not start a line. */
export interface QuoteGroup {
	readonly wordIndex: number;
	readonly before: string;
	readonly after: string;
}

const OPENING = /^[「『]+$/;

/** Opening marks go with the next word, the others with the previous one. */
export function quoteGroupsOf(tokens: readonly QuoteToken[]): QuoteGroup[] {
	const groups: QuoteGroup[] = [];
	let before = '';
	for (const token of tokens) {
		const last = groups.at(-1);
		if (token.kind === 'word') {
			groups.push({ wordIndex: groups.length, before, after: '' });
			before = '';
		} else if (OPENING.test(token.text) || !last) {
			before += token.text;
		} else {
			groups[groups.length - 1] = {
				...last,
				after: last.after + token.text,
			};
		}
	}
	return groups;
}

export interface PieceView {
	readonly piece: QuotePiece;
	readonly units: readonly UnitView[];
}

/** Gives each part of a word the units typed for it (じんせい for 人生). */
export function pieceViewsOf(
	word: QuoteWord,
	units: readonly UnitView[],
): PieceView[] {
	let offset = 0;
	let start = 0;
	return word.pieces.map((piece) => {
		const end = offset + (piece.reading ?? piece.text).length;
		const taken: UnitView[] = [];
		for (const unit of units.slice(start)) {
			if (offset >= end) {
				break;
			}
			taken.push(unit);
			offset += unit.kana.length;
		}
		start += taken.length;
		return { piece, units: taken };
	});
}

/** The state of a kanji from the units read under it. */
export function pieceStateOf(units: readonly UnitView[]): UnitView['state'] {
	const states = units.map((unit) => unit.state);
	const isTyped = (state: UnitView['state']) =>
		state === 'typed' || state === 'faulty';
	if (states.every(isTyped)) {
		return states.includes('faulty') ? 'faulty' : 'typed';
	}
	const isStarted = states.some(isTyped) || states.includes('partial');
	if (isStarted) {
		return 'partial';
	}
	return states.includes('next') ? 'next' : 'pending';
}
