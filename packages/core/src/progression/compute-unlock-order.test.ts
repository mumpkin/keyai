import { describe, expect, it } from 'vitest';
import { findKana, KANA_CATALOGUE } from '../kana/catalogue.ts';
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

describe('computeUnlockOrder', () => {
	it('orders every kana of the catalogue exactly once', () => {
		expect(RESULT.order).toHaveLength(KANA_CATALOGUE.length);
		expect(new Set(RESULT.order).size).toBe(KANA_CATALOGUE.length);
	});

	it('places every kana after its prerequisites', () => {
		const position = new Map(
			RESULT.order.map((kana, index) => [kana, index]),
		);
		for (const unit of KANA_CATALOGUE) {
			for (const prerequisite of prerequisitesOf(unit)) {
				expect(position.get(prerequisite)).toBeLessThan(
					position.get(unit.text) ?? -1,
				);
			}
		}
	});

	it('starts with a hiragana group that opens enough frequent words', () => {
		const initial = RESULT.order.slice(0, RESULT.initialUnlocked);
		expect(RESULT.initialUnlocked).toBeGreaterThanOrEqual(6);
		expect(RESULT.initialUnlocked).toBeLessThanOrEqual(10);
		expect(initial.every((kana) => scriptOf(kana) === 'hiragana')).toBe(
			true,
		);
		expect(initial).toEqual(expect.arrayContaining(['の', 'に', 'か']));
		expect(initial[0]).toBe('か');
	});

	it('introduces katakana before the end of the hiragana', () => {
		const firstKatakana = RESULT.order.findIndex(
			(kana) => scriptOf(kana) === 'katakana',
		);
		const lastHiragana = RESULT.order.findLastIndex(
			(kana) => scriptOf(kana) === 'hiragana',
		);
		expect(firstKatakana).toBeLessThan(lastHiragana);
	});

	it('brings katakana words to completion one kana at a time', () => {
		const position = (kana: string) => RESULT.order.indexOf(kana);
		const testWord = ['テ', 'ス', 'ト'].map(position);
		const rest = KANA_CATALOGUE.filter((unit) => unit.script === 'katakana')
			.map((unit) => position(unit.text))
			.filter((index) => !testWord.includes(index));
		expect(Math.max(...testWord)).toBeLessThan(Math.max(...rest));
	});

	it('never chains more than three unlocks of a script while words remain', () => {
		const opening = RESULT.order.slice(RESULT.initialUnlocked, 40);
		let streak = 0;
		for (const [index, kana] of opening.entries()) {
			const isSameScript =
				scriptOf(kana) === scriptOf(opening[index - 1] ?? '');
			streak = isSameScript ? streak + 1 : 1;
			expect(streak).toBeLessThanOrEqual(3);
		}
	});

	it('is deterministic', () => {
		expect(computeUnlockOrder(VOCABULARY)).toEqual(RESULT);
	});
});
