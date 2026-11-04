import { describe, expect, it } from 'vitest';
import { kanaLayoutOf } from './kana-layout.ts';
import { kanaStatesOf, masteryColorOf } from './kana-states.ts';

const FAST = { ms: 1000, error: false };
const ORDER = ['い', 'か', 'く', 'こ'];

function statesFor(unlocked: string[]) {
	return kanaStatesOf({
		progress: {
			unlocked,
			kana: Object.fromEntries([
				['い', { seen: 5, errors: 0, recent: Array(5).fill(FAST) }],
			]),
		},
		unlockOrder: ORDER,
		initialUnlocked: 2,
		thresholdKanaPerMinute: 30,
	});
}

describe('kanaStatesOf', () => {
	it('distinguishes mastered, learning, next and locked kana', () => {
		const states = statesFor(['い', 'か']);
		expect(states.stateOf('い')).toBe('mastered');
		expect(states.stateOf('か')).toBe('learning');
		expect(states.stateOf('く')).toBe('next');
		expect(states.stateOf('こ')).toBe('locked');
		expect(states.scoreOf('い')).toBe(1);
	});

	it('only marks as new a kana unlocked by playing', () => {
		expect(statesFor(['い', 'か']).stateOf('か')).not.toBe('latest');
		expect(statesFor(['い', 'か', 'く']).stateOf('く')).toBe('latest');
	});
});

describe('masteryColorOf', () => {
	it('goes from orange to green with the mastery score', () => {
		expect(masteryColorOf(0)).toContain('var(--mastery-low) 100%');
		expect(masteryColorOf(0.25)).toContain('var(--mastery-low) 75%');
		expect(masteryColorOf(1)).toContain('var(--mastery-low) 0%');
	});
});

describe('kanaLayoutOf', () => {
	it('lays out the gojūon chart with gaps', () => {
		const layout = kanaLayoutOf('hiragana');
		expect(layout.base).toHaveLength(55);
		expect(layout.base.filter((slot) => slot.kana === null)).toHaveLength(
			9,
		);
		expect(layout.base[5]?.kana).toBe('か');
		expect(layout.combinations).toHaveLength(33);
		expect(layout.others.map((slot) => slot.kana)).toEqual(['っ']);
	});

	it('converts the chart to katakana and adds the katakana-only kana', () => {
		const layout = kanaLayoutOf('katakana');
		expect(layout.base[0]?.kana).toBe('ア');
		expect(layout.voiced[0]?.kana).toBe('ガ');
		expect(layout.others.map((slot) => slot.kana)).toContain('ー');
		expect(layout.others.map((slot) => slot.kana)).toContain('ティ');
	});
});
