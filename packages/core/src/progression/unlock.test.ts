import { describe, expect, it } from 'vitest';
import { recordAttempts } from './record.ts';
import { cleanAttempts, ONE_SECOND } from './test-helpers.ts';
import { applySeries, createProgress, nextKanaOf } from './unlock.ts';

const ORDER = ['い', 'の', 'に', 'か', 'く'];
const RULES = { unlockOrder: ORDER, thresholdKanaPerMinute: 30 };

describe('createProgress', () => {
	it('unlocks the initial group', () => {
		expect(createProgress(ORDER, 2)).toEqual({
			unlocked: ['い', 'の'],
			kana: {},
		});
	});
});

describe('recordAttempts', () => {
	it('counts attempts and errors and keeps the last ten samples', () => {
		const attempts = [
			...cleanAttempts('い', 12),
			{ kana: 'い', durationMs: null, hadError: false, skipped: true },
		];
		const stats = recordAttempts(createProgress(ORDER, 1), attempts).kana
			.い;
		expect(stats?.seen).toBe(13);
		expect(stats?.errors).toBe(1);
		expect(stats?.recent).toHaveLength(10);
		expect(stats?.recent.at(-1)).toEqual({ ms: null, error: true });
	});
});

describe('applySeries', () => {
	it('unlocks the next kana once every unlocked kana is mastered', () => {
		const progress = createProgress(ORDER, 2);
		const attempts = [...cleanAttempts('い', 5), ...cleanAttempts('の', 5)];
		const outcome = applySeries(progress, attempts, RULES);
		expect(outcome.unlockedKana).toBe('に');
		expect(outcome.progress.unlocked).toEqual(['い', 'の', 'に']);
	});

	it('waits while an unlocked kana is not mastered', () => {
		const progress = createProgress(ORDER, 2);
		const outcome = applySeries(progress, cleanAttempts('い', 5), RULES);
		expect(outcome.unlockedKana).toBeUndefined();
		expect(outcome.progress.unlocked).toEqual(['い', 'の']);
	});

	it('unlocks at most one kana per series', () => {
		const progress = createProgress(ORDER, 2);
		const attempts = ORDER.flatMap((kana) => cleanAttempts(kana, 5));
		expect(
			applySeries(progress, attempts, RULES).progress.unlocked,
		).toHaveLength(3);
	});

	it('stops once every kana of the order is unlocked', () => {
		const progress = createProgress(ORDER, ORDER.length);
		const attempts = ORDER.flatMap((kana) => cleanAttempts(kana, 5));
		expect(
			applySeries(progress, attempts, RULES).unlockedKana,
		).toBeUndefined();
		expect(nextKanaOf(progress, ORDER)).toBeUndefined();
	});

	it('does not unlock when the speed threshold is not met', () => {
		const slowRules = { ...RULES, thresholdKanaPerMinute: 120 };
		const attempts = [...cleanAttempts('い', 5), ...cleanAttempts('の', 5)];
		expect(
			applySeries(createProgress(ORDER, 2), attempts, slowRules)
				.unlockedKana,
		).toBeUndefined();
		expect(ONE_SECOND).toBe(1000);
	});
});
