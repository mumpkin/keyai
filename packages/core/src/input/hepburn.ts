import type { KanaUnit } from '../kana/types.ts';
import { isAmbiguousAfterNasal } from './spellings.ts';

function displayAt(units: readonly KanaUnit[], index: number): string {
	const unit = units[index] as KanaUnit;
	const next = units[index + 1];
	const nextDisplay = next?.romaji.display ?? '';

	switch (unit.kind) {
		case 'nasal':
			return isAmbiguousAfterNasal(next) ? "n'" : 'n';
		case 'sokuon':
			return nextDisplay.startsWith('ch') ? 't' : (nextDisplay[0] ?? '');
		default:
			return unit.romaji.display;
	}
}

/** Hepburn reading of a word ('きって' → 'kitte', 'きんえん' → "kin'en"). */
export function toHepburn(units: readonly KanaUnit[]): string {
	return units.map((_, index) => displayAt(units, index)).join('');
}
