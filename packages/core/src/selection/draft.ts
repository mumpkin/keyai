import { pickWeighted, type Random } from '../random/random.ts';
import type { VocabEntry } from '../vocab/entries.ts';

const SINGLE_UNIT_CAP = 0.2;
const WEAK_KANA_BONUS = 1;

/** How strict a draw is; looser tiers relax the variety rules (C5). */
export interface DrawTier {
	readonly allowsRepetition: boolean;
	readonly ignoresSingleUnitCap: boolean;
}

export const NEW_WORDS_ONLY: readonly DrawTier[] = [
	{ allowsRepetition: false, ignoresSingleUnitCap: false },
	{ allowsRepetition: false, ignoresSingleUnitCap: true },
];

/** Relaxation order of C5: the single-unit cap first, repetitions last. */
export const ANY_WORD: readonly DrawTier[] = [
	...NEW_WORDS_ONLY,
	{ allowsRepetition: true, ignoresSingleUnitCap: true },
];
/** A series being built. Mutated only by the functions of this module. */
export interface SeriesDraft {
	readonly eligible: readonly VocabEntry[];
	readonly weakKana: ReadonlySet<string>;
	readonly length: number;
	readonly random: Random;
	readonly selected: VocabEntry[];
}

function frequencyWeight(entry: VocabEntry): number {
	return 1 / Math.log2(entry.word.rank + 1);
}

function weightOf(draft: SeriesDraft, entry: VocabEntry): number {
	const weakCount = [...entry.kanaSet].filter((kana) =>
		draft.weakKana.has(kana),
	).length;
	return frequencyWeight(entry) + WEAK_KANA_BONUS * weakCount;
}

function isSingleUnit(entry: VocabEntry): boolean {
	return entry.units.length === 1;
}

function allows(draft: SeriesDraft, tier: DrawTier, entry: VocabEntry) {
	const isNew = !draft.selected.includes(entry);
	const singleUnitCount = draft.selected.filter(isSingleUnit).length;
	const capReached =
		singleUnitCount >= Math.floor(draft.length * SINGLE_UNIT_CAP);
	return (
		(tier.allowsRepetition || isNew) &&
		(tier.ignoresSingleUnitCap || !(isSingleUnit(entry) && capReached))
	);
}

function usesOf(draft: SeriesDraft, entry: VocabEntry): number {
	return draft.selected.filter((selected) => selected === entry).length;
}

/**
 * When words must repeat, only the least used ones are drawn, so that
 * repetitions stay balanced and can be kept apart.
 */
function leastUsed(
	draft: SeriesDraft,
	candidates: readonly VocabEntry[],
): VocabEntry[] {
	const fewestUses = Math.min(
		...candidates.map((entry) => usesOf(draft, entry)),
	);
	return candidates.filter((entry) => usesOf(draft, entry) === fewestUses);
}

export function isFull(draft: SeriesDraft): boolean {
	return draft.selected.length >= draft.length;
}

/**
 * Adds one word matching `predicate`, using the strictest tier that offers
 * a candidate. Returns whether a word was added.
 */
export function drawInto(
	draft: SeriesDraft,
	predicate: (entry: VocabEntry) => boolean,
	tiers: readonly DrawTier[],
): boolean {
	for (const tier of tiers) {
		const allowed = draft.eligible.filter(
			(entry) => predicate(entry) && allows(draft, tier, entry),
		);
		const candidates = tier.allowsRepetition
			? leastUsed(draft, allowed)
			: allowed;
		const picked = pickWeighted(
			candidates,
			(entry) => weightOf(draft, entry),
			draft.random,
		);
		if (picked) {
			draft.selected.push(picked);
			return true;
		}
	}
	return false;
}
