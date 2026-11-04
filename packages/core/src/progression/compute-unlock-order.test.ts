import { describe, expect, it } from 'vitest';
import { findKana } from '../kana/catalogue.ts';
import { computeUnlockOrder } from './compute-unlock-order.ts';
import { prerequisitesOf } from './prerequisites.ts';
import type { WeightedWord } from './unlock-order.ts';

const HIGH = 7;
const MEDIUM = 5;
const LOW = 3;

function word(units: string, weight: number): WeightedWord {
	return { units: [...units], weight };
}

const VOCABULARY: WeightedWord[] = [
	word('の', HIGH),
	word('に', HIGH),
	word('か', HIGH),
	word('いぬ', MEDIUM),
	word('くに', MEDIUM),
	word('いか', MEDIUM),
	word('なか', MEDIUM),
	word('かな', LOW),
	word('のこ', LOW),
	word('こい', LOW),
	word('いい', MEDIUM),
	word('いく', MEDIUM),
	word('かく', LOW),
	word('きく', LOW),
	word('くし', LOW),
	word('いし', LOW),
	word('しか', LOW),
	word('テスト', MEDIUM),
	word('ノート', LOW),
	word('カメラ', LOW),
];

const RESULT = computeUnlockOrder(VOCABULARY);

function scriptOf(kana: string) {
	return findKana(kana)?.script;
}

const USED_KANA = new Set(VOCABULARY.flatMap((item) => item.units));

function wordsOpenedBy(
	order: readonly string[],
	index: number,
): WeightedWord[] {
	const unlocked = new Set(order.slice(0, index + 1));
	return VOCABULARY.filter(
		(item) =>
			item.units.includes(order[index] ?? '') &&
			item.units.every((kana) => unlocked.has(kana)),
	);
}

describe('computeUnlockOrder', () => {
	it('only orders kana that appear in a word, each exactly once', () => {
		expect(new Set(RESULT.order).size).toBe(RESULT.order.length);
		expect(RESULT.order.every((kana) => USED_KANA.has(kana))).toBe(true);
		expect(RESULT.order).not.toContain('ヲ');
	});

	it('places every kana after its reachable prerequisites', () => {
		const position = new Map(
			RESULT.order.map((kana, index) => [kana, index]),
		);
		const pairs = RESULT.order
			.slice(RESULT.initialUnlocked)
			.flatMap((kana) => {
				const unit = findKana(kana);
				const prerequisites = unit ? prerequisitesOf(unit) : [];
				return prerequisites
					.filter((prerequisite) => USED_KANA.has(prerequisite))
					.map((prerequisite) => ({ kana, prerequisite }));
			});
		for (const { kana, prerequisite } of pairs) {
			expect(position.get(prerequisite)).toBeLessThan(
				position.get(kana) ?? -1,
			);
		}
	});

	it('starts with a group in each script', () => {
		const initial = RESULT.order.slice(0, RESULT.initialUnlocked);
		const scripts = new Set(initial.map(scriptOf));
		expect(scripts).toEqual(new Set(['hiragana', 'katakana']));
		expect(initial[0]).toBe('か');
	});

	it('keeps only practicable kana in the initial group', () => {
		const initial = new Set(RESULT.order.slice(0, RESULT.initialUnlocked));
		const typeable = VOCABULARY.filter((item) =>
			item.units.every((kana) => initial.has(kana)),
		);
		const practised = new Set(typeable.flatMap((item) => item.units));
		expect(practised).toEqual(initial);
	});

	it('opens at least one word with every later kana', () => {
		for (
			let index = RESULT.initialUnlocked;
			index < RESULT.order.length;
			index += 1
		) {
			expect(wordsOpenedBy(RESULT.order, index).length).toBeGreaterThan(
				0,
			);
		}
	});

	it('is deterministic', () => {
		expect(computeUnlockOrder(VOCABULARY)).toEqual(RESULT);
	});
});
