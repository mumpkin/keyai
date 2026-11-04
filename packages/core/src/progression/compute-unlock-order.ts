import { KANA_CATALOGUE } from '../kana/catalogue.ts';
import type { KanaUnit } from '../kana/types.ts';
import {
	type Candidate,
	candidatesOf,
	DEFAULT_UNLOCK_ORDER_OPTIONS,
	isTypeableWith,
	katakanaGroupCandidatesOf,
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

interface GroupLimits {
	readonly size: number;
	readonly minimumWords: number;
	readonly maximumSize: number;
}

function typeableWords(inputs: OrderInputs, unlocked: ReadonlySet<string>) {
	return inputs.words.filter((word) => isTypeableWith(word, unlocked));
}

function buildGroup(
	inputs: OrderInputs,
	limits: GroupLimits,
	nextCandidate: (state: OrderState) => Candidate | undefined,
): string[] {
	const state: OrderState = { order: [], unlocked: new Set() };
	const needsMore = () =>
		state.order.length < limits.maximumSize &&
		(state.order.length < limits.size ||
			typeableWords(inputs, state.unlocked).length < limits.minimumWords);
	while (needsMore()) {
		const best = nextCandidate(state);
		if (!best) {
			break;
		}
		unlockInto(state, best.unit);
	}
	const practicable = new Set(
		typeableWords(inputs, state.unlocked).flatMap((word) => word.units),
	);
	return state.order.filter((kana) => practicable.has(kana));
}

function hiraganaGroup(inputs: OrderInputs): string[] {
	const { options, words, catalogue } = inputs;
	return buildGroup(
		inputs,
		{
			size: options.initialGroupSize,
			minimumWords: options.minimumInitialWords,
			maximumSize: options.maximumInitialGroupSize,
		},
		(state) =>
			candidatesOf(state, words, catalogue).find(
				({ unit }) => unit.script === 'hiragana',
			),
	);
}

function katakanaGroup(inputs: OrderInputs): string[] {
	const { options, words, catalogue } = inputs;
	return buildGroup(
		inputs,
		{
			size: options.initialKatakanaGroupSize,
			minimumWords: options.minimumInitialKatakanaWords,
			maximumSize: options.maximumInitialKatakanaGroupSize,
		},
		(state) => katakanaGroupCandidatesOf(state, words, catalogue)[0],
	);
}

/**
 * Best kana opening a new word, unless one script has had too many unlocks
 * in a row while the other can open a word (balance rule of C2). A kana
 * that opens no word could not be practised, so it is never chosen.
 */
function nextUnit(
	inputs: OrderInputs,
	state: OrderState,
): KanaUnit | undefined {
	const candidates = candidatesOf(
		state,
		inputs.words,
		inputs.catalogue,
	).filter((candidate) => candidate.gain > 0);
	const streak = scriptStreak(state.order, inputs.catalogue);
	if (streak.length >= inputs.options.maximumConsecutiveUnlocks) {
		const other = candidates.find(
			(candidate) => candidate.unit.script !== streak.script,
		);
		if (other) {
			return other.unit;
		}
	}
	return candidates[0]?.unit;
}

/**
 * Unlock order (C2): an initial group in each script, then the kana opening
 * the most frequent words, with prerequisites, a balance between scripts
 * and gojūon tie-breaks. Every kana of the order can be practised as soon
 * as it is unlocked; kana that appear in no word are left out.
 */
export function computeUnlockOrder(
	words: readonly WeightedWord[],
	options: UnlockOrderOptions = DEFAULT_UNLOCK_ORDER_OPTIONS,
	catalogue: readonly KanaUnit[] = KANA_CATALOGUE,
): UnlockOrder {
	const usedKana = new Set(words.flatMap((word) => word.units));
	const inputs = {
		words,
		catalogue: catalogue.filter((unit) => usedKana.has(unit.text)),
		options,
	};
	const initial = [...hiraganaGroup(inputs), ...katakanaGroup(inputs)];
	const state: OrderState = {
		order: [...initial],
		unlocked: new Set(initial),
	};
	let next = nextUnit(inputs, state);
	while (next) {
		unlockInto(state, next);
		next = nextUnit(inputs, state);
	}
	return { order: state.order, initialUnlocked: initial.length };
}
