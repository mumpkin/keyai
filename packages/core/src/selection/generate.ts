import { type Random, shuffle } from '../random/random.ts';
import type { VocabEntry } from '../vocab/entries.ts';
import type { SelectionContext } from './context.ts';
import {
	ANY_WORD,
	drawInto,
	isFull,
	NEW_WORDS_ONLY,
	type SeriesDraft,
} from './draft.ts';

const FEATURED_SHARE = 0.5;

function contains(kana: string) {
	return (entry: VocabEntry) => entry.kanaSet.has(kana);
}

function coverWeakKana(draft: SeriesDraft, weakKana: readonly string[]) {
	for (const kana of weakKana) {
		if (isFull(draft)) {
			return;
		}
		drawInto(draft, contains(kana), NEW_WORDS_ONLY);
	}
}

function featureKana(draft: SeriesDraft, kana: string | undefined) {
	if (kana === undefined) {
		return;
	}
	const target = Math.round(draft.length * FEATURED_SHARE);
	const featuredCount = () => draft.selected.filter(contains(kana)).length;
	while (featuredCount() < target && !isFull(draft)) {
		if (!drawInto(draft, contains(kana), NEW_WORDS_ONLY)) {
			return;
		}
	}
}

function fill(draft: SeriesDraft) {
	while (!isFull(draft)) {
		if (!drawInto(draft, () => true, ANY_WORD)) {
			return;
		}
	}
}

function remainingCounts(words: readonly VocabEntry[]) {
	const counts = new Map<VocabEntry, number>();
	for (const word of words) {
		counts.set(word, (counts.get(word) ?? 0) + 1);
	}
	return counts;
}

/**
 * Index of the next word to place: different from the previous one,
 * preferring the word left the most times so that repetitions can still be
 * spread out; ties keep the shuffled order.
 */
function indexOfNext(
	remaining: readonly VocabEntry[],
	previous: VocabEntry | undefined,
): number {
	const counts = remainingCounts(remaining);
	let bestIndex = -1;
	for (const [index, word] of remaining.entries()) {
		const best = remaining[bestIndex];
		const isBetter =
			best === undefined ||
			(counts.get(word) ?? 0) > (counts.get(best) ?? 0);
		if (word !== previous && isBetter) {
			bestIndex = index;
		}
	}
	return Math.max(bestIndex, 0);
}

/** Orders words so that the same word never appears twice in a row. */
function withoutImmediateRepetition(
	words: readonly VocabEntry[],
): VocabEntry[] {
	const remaining = [...words];
	const ordered: VocabEntry[] = [];
	while (remaining.length > 0) {
		const index = indexOfNext(remaining, ordered.at(-1));
		ordered.push(...remaining.splice(index, 1));
	}
	return ordered;
}

/**
 * Words of a series (C5): coverage of weak kana, featured kana for about
 * half of the series, then a weighted fill, in shuffled order.
 */
export function generateSeries(
	context: SelectionContext,
	length: number,
	random: Random,
): VocabEntry[] {
	const eligible = context.entries.filter((entry) =>
		entry.units.every((kana) => context.unlocked.has(kana)),
	);
	const draft: SeriesDraft = {
		eligible,
		weakKana: new Set(context.weakKana),
		length,
		random,
		selected: [],
	};
	coverWeakKana(draft, context.weakKana);
	featureKana(draft, context.featuredKana);
	fill(draft);
	return withoutImmediateRepetition(shuffle(draft.selected, random));
}
