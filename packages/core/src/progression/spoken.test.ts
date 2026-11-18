import { describe, expect, it } from 'vitest';
import { recordAttempts } from './record.ts';
import {
	recordSpokenWords,
	type SpokenWord,
	spokenMasteryOf,
} from './spoken.ts';
import { cleanAttempts } from './test-helpers.ts';
import {
	applySeries,
	applySpokenSeries,
	blockingKanaOf,
	createProgress,
} from './unlock.ts';

const ORDER = ['い', 'の', 'に', 'か', 'く'];
const RULES = { unlockOrder: ORDER, thresholdKanaPerMinute: 30 };

function said(
	units: readonly string[],
	heardFirstTry = true,
	skipped = false,
): SpokenWord {
	return { units, heardFirstTry, skipped, readingMs: 1200 };
}

function saidTimes(units: readonly string[], count: number): SpokenWord[] {
	return Array.from({ length: count }, () => said(units));
}

describe('recordSpokenWords', () => {
	it('records each kana of a word once, with its share of the time', () => {
		const progress = recordSpokenWords(createProgress(ORDER, 2), [
			said(['い', 'の', 'い']),
		]);
		expect(progress.spoken?.い).toEqual({
			seen: 1,
			misses: 0,
			recent: [{ firstTry: true, ms: 400 }],
		});
		expect(progress.spoken?.の?.seen).toBe(1);
	});

	it('counts a word heard after a retry or skipped as a miss', () => {
		const progress = recordSpokenWords(createProgress(ORDER, 2), [
			said(['い'], false),
			said(['い'], true, true),
		]);
		expect(progress.spoken?.い?.misses).toBe(2);
		expect(
			progress.spoken?.い?.recent.map((sample) => sample.firstTry),
		).toEqual([false, false]);
	});

	it('leaves the typing statistics alone', () => {
		const progress = recordSpokenWords(createProgress(ORDER, 2), [
			said(['い']),
		]);
		expect(progress.kana).toEqual({});
	});
});

describe('spokenMasteryOf', () => {
	it('needs at least five words', () => {
		const stats = recordSpokenWords(
			createProgress(ORDER, 1),
			saidTimes(['い'], 4),
		).spoken?.い;
		expect(spokenMasteryOf(stats).isMastered).toBe(false);
	});

	it('accepts 80 % of words heard at the first try', () => {
		const words = [
			...saidTimes(['い'], 8),
			said(['い'], false),
			said(['い'], false),
		];
		const stats = recordSpokenWords(createProgress(ORDER, 1), words).spoken
			?.い;
		expect(spokenMasteryOf(stats)).toMatchObject({
			isMastered: true,
			firstTryRatio: 0.8,
		});
	});

	it('refuses 70 %', () => {
		const words = [
			...saidTimes(['い'], 7),
			...Array.from({ length: 3 }, () => said(['い'], false)),
		];
		const stats = recordSpokenWords(createProgress(ORDER, 1), words).spoken
			?.い;
		expect(spokenMasteryOf(stats).isMastered).toBe(false);
	});

	it('has no mastery without any word', () => {
		expect(spokenMasteryOf(undefined).score).toBe(0);
	});
});

describe('unlocking by speaking or typing', () => {
	it('unlocks once the last kana are mastered by speaking', () => {
		const outcome = applySpokenSeries(
			createProgress(ORDER, 2),
			saidTimes(['い', 'の'], 5),
			RULES,
		);
		expect(outcome.unlockedKana).toBe('に');
	});

	it('mixes both ways: one kana typed, the other spoken', () => {
		const typed = recordAttempts(
			createProgress(ORDER, 2),
			cleanAttempts('い', 5),
		);
		const spoken = recordSpokenWords(typed, saidTimes(['の'], 5));
		expect(blockingKanaOf(spoken, RULES.thresholdKanaPerMinute)).toEqual(
			[],
		);
		expect(applySeries(spoken, [], RULES).unlockedKana).toBe('に');
	});

	it('never unlocks after a spoken series with a skipped word', () => {
		const words = [...saidTimes(['い', 'の'], 5), said(['い'], true, true)];
		expect(
			applySpokenSeries(createProgress(ORDER, 2), words, RULES)
				.unlockedKana,
		).toBeUndefined();
	});

	it('unlocks nothing in a revision', () => {
		expect(
			applySpokenSeries(
				createProgress(ORDER, 2),
				saidTimes(['い', 'の'], 5),
				{
					...RULES,
					isRevision: true,
				},
			).unlockedKana,
		).toBeUndefined();
	});
});
