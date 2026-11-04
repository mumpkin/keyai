import { KANA_CATALOGUE } from '../kana/catalogue.ts';
import type { KanaUnit } from '../kana/types.ts';
import {
	type Candidate,
	candidatesOf,
	DEFAULT_UNLOCK_ORDER_OPTIONS,
	isTypeableWith,
	type OrderState,
	scriptStreak,
	type UnlockOrder,
	type UnlockOrderOptions,
	unlockInto,
	type WeightedWord,
} from './unlock-order.ts';

interface OrderInputs {
	readonly words: readonly WeightedWord[];
	readonly catalogue: readonly KanaUnit[];
	readonly options: UnlockOrderOptions;
}

function typeableCount(inputs: OrderInputs, state: OrderState): number {
	return inputs.words.filter((word) => isTypeableWith(word, state.unlocked))
		.length;
}

function needsMoreInitialKana(inputs: OrderInputs, state: OrderState) {
	const { options } = inputs;
	const size = state.order.length;
	return (
		size < options.maximumInitialGroupSize &&
		(size < options.initialGroupSize ||
			typeableCount(inputs, state) < options.minimumInitialWords)
	);
}

/** Initial group: hiragana only, enough to type a few frequent words. */
function buildInitialGroup(inputs: OrderInputs, state: OrderState): void {
	while (needsMoreInitialKana(inputs, state)) {
		const [best] = candidatesOf(
			state,
			inputs.words,
			inputs.catalogue,
		).filter(({ unit }) => unit.script === 'hiragana');
		if (!best) {
			return;
		}
		unlockInto(state, best.unit);
	}
}

function isWorthwhile(candidate: Candidate): boolean {
	return candidate.gain > 0 || candidate.progress > 0;
}

/**
 * Best candidate, unless one script has had too many unlocks in a row
 * while the other has a worthwhile candidate (balance rule of C2).
 */
function nextUnit(
	inputs: OrderInputs,
	state: OrderState,
): KanaUnit | undefined {
	const candidates = candidatesOf(state, inputs.words, inputs.catalogue);
	const streak = scriptStreak(state.order, inputs.catalogue);
	if (streak.length >= inputs.options.maximumConsecutiveUnlocks) {
		const other = candidates.find(
			(candidate) =>
				candidate.unit.script !== streak.script &&
				isWorthwhile(candidate),
		);
		if (other) {
			return other.unit;
		}
	}
	return candidates[0]?.unit;
}

/**
 * Unlock order of every kana (C2): greedy on the frequent words each kana
 * opens, then on the words it brings closer to completion, with
 * prerequisites, a balance between scripts and gojūon tie-breaks.
 */
export function computeUnlockOrder(
	words: readonly WeightedWord[],
	options: UnlockOrderOptions = DEFAULT_UNLOCK_ORDER_OPTIONS,
	catalogue: readonly KanaUnit[] = KANA_CATALOGUE,
): UnlockOrder {
	const inputs = { words, catalogue, options };
	const state: OrderState = { order: [], unlocked: new Set() };
	buildInitialGroup(inputs, state);
	const initialUnlocked = state.order.length;
	let next = nextUnit(inputs, state);
	while (next) {
		unlockInto(state, next);
		next = nextUnit(inputs, state);
	}
	return { order: state.order, initialUnlocked };
}
