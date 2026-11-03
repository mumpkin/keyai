import { findKana } from '../kana/catalogue.ts';
import type { KanaUnit } from '../kana/types.ts';

/** Longest unit text in the catalogue ('きゃ', 'ティ'). */
const LONGEST_UNIT_LENGTH = 2;

export class UnknownKanaError extends Error {
	readonly text: string;
	readonly position: number;

	constructor(text: string, position: number) {
		super(`Unknown kana "${text}" at position ${position}`);
		this.name = 'UnknownKanaError';
		this.text = text;
		this.position = position;
	}
}

function longestUnitAt(
	characters: readonly string[],
	position: number,
): KanaUnit | undefined {
	for (let length = LONGEST_UNIT_LENGTH; length > 0; length -= 1) {
		const candidate = characters
			.slice(position, position + length)
			.join('');
		const unit = findKana(candidate);
		if (unit) {
			return unit;
		}
	}
	return undefined;
}

/**
 * Splits a kana word into catalogue units, longest match first
 * ('きゃく' → 'きゃ', 'く').
 *
 * @throws UnknownKanaError when a character is not in the catalogue.
 */
export function tokenize(word: string): KanaUnit[] {
	const characters = [...word.normalize('NFC')];
	const units: KanaUnit[] = [];
	let position = 0;

	while (position < characters.length) {
		const unit = longestUnitAt(characters, position);
		if (!unit) {
			throw new UnknownKanaError(characters[position] ?? '', position);
		}
		units.push(unit);
		position += [...unit.text].length;
	}
	return units;
}
