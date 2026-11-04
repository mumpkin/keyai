import type { KanaUnit, Script } from '../kana/types.ts';
import { prerequisitesOf } from './prerequisites.ts';

export interface WeightedWord {
	readonly units: readonly string[];
	/** Log-scale frequency (wordfreq Zipf value). */
	readonly weight: number;
}

export interface UnlockOrderOptions {
	readonly initialGroupSize: number;
	readonly minimumInitialWords: number;
	readonly maximumInitialGroupSize: number;
	readonly maximumConsecutiveUnlocks: number;
	readonly initialKatakanaGroupSize: number;
	readonly minimumInitialKatakanaWords: number;
	readonly maximumInitialKatakanaGroupSize: number;
}

export const DEFAULT_UNLOCK_ORDER_OPTIONS: UnlockOrderOptions = {
	initialGroupSize: 6,
	minimumInitialWords: 15,
	maximumInitialGroupSize: 10,
	maximumConsecutiveUnlocks: 3,
	initialKatakanaGroupSize: 6,
	minimumInitialKatakanaWords: 5,
	maximumInitialKatakanaGroupSize: 8,
};

export interface UnlockOrder {
	readonly order: readonly string[];
	readonly initialUnlocked: number;
}

export interface Candidate {
	readonly unit: KanaUnit;
	/** Weight of the words this kana makes typeable. */
	readonly gain: number;
	/** Weight of the words it brings closer to completion. */
	readonly progress: number;
}

export function isTypeableWith(
	word: WeightedWord,
	unlocked: ReadonlySet<string>,
) {
	return word.units.every((kana) => unlocked.has(kana));
}

function scoreOf(
	unit: KanaUnit,
	words: readonly WeightedWord[],
	unlocked: ReadonlySet<string>,
): Candidate {
	let gain = 0;
	let progress = 0;
	for (const word of words) {
		if (!word.units.includes(unit.text) || isTypeableWith(word, unlocked)) {
			continue;
		}
		const known = word.units.filter(
			(kana) => kana === unit.text || unlocked.has(kana),
		).length;
		progress += (word.weight * known) / word.units.length;
		gain += known === word.units.length ? word.weight : 0;
	}
	return { unit, gain, progress };
}

/** Most words opened, then closest to completion, then gojūon order. */
function compareCandidates(first: Candidate, second: Candidate): number {
	return (
		second.gain - first.gain ||
		second.progress - first.progress ||
		first.unit.gojuon - second.unit.gojuon ||
		Number(first.unit.script === 'katakana') -
			Number(second.unit.script === 'katakana')
	);
}

export interface OrderState {
	readonly order: string[];
	readonly unlocked: Set<string>;
}

/** Prerequisites that can be met: kana without any word never unlock. */
function reachablePrerequisitesOf(
	unit: KanaUnit,
	catalogue: readonly KanaUnit[],
): string[] {
	return prerequisitesOf(unit).filter((kana) =>
		catalogue.some((candidate) => candidate.text === kana),
	);
}

export function candidatesOf(
	state: OrderState,
	words: readonly WeightedWord[],
	catalogue: readonly KanaUnit[],
): Candidate[] {
	return catalogue
		.filter(
			(unit) =>
				!state.unlocked.has(unit.text) &&
				reachablePrerequisitesOf(unit, catalogue).every((kana) =>
					state.unlocked.has(kana),
				),
		)
		.map((unit) => scoreOf(unit, words, state.unlocked))
		.sort(compareCandidates);
}

/**
 * Candidates of the katakana group, available from the start: only the
 * prerequisites within katakana apply, not the hiragana counterpart.
 */
export function katakanaGroupCandidatesOf(
	state: OrderState,
	words: readonly WeightedWord[],
	catalogue: readonly KanaUnit[],
): Candidate[] {
	const katakana = catalogue.filter((unit) => unit.script === 'katakana');
	return katakana
		.filter(
			(unit) =>
				!state.unlocked.has(unit.text) &&
				reachablePrerequisitesOf(unit, katakana).every((kana) =>
					state.unlocked.has(kana),
				),
		)
		.map((unit) => scoreOf(unit, words, state.unlocked))
		.sort(compareCandidates);
}

export function unlockInto(state: OrderState, unit: KanaUnit): void {
	state.order.push(unit.text);
	state.unlocked.add(unit.text);
}

export function scriptStreak(
	order: readonly string[],
	catalogue: readonly KanaUnit[],
): { readonly script: Script | undefined; readonly length: number } {
	const scripts = order.map(
		(kana) => catalogue.find((unit) => unit.text === kana)?.script,
	);
	const last = scripts.at(-1);
	const differentIndex = scripts.findLastIndex((script) => script !== last);
	return { script: last, length: scripts.length - 1 - differentIndex };
}
