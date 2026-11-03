import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { masteryOf, median } from './mastery.ts';
import { ONE_SECOND, samples, statsOf } from './test-helpers.ts';

const FAST_CLEAN = { ms: ONE_SECOND, error: false };
const FAST_FAULTY = { ms: ONE_SECOND, error: true };
const THRESHOLD = 30;

describe('median', () => {
	it('takes the middle value, or the mean of the two middle values', () => {
		expect(median([3, 1, 2])).toBe(2);
		expect(median([4, 1, 3, 2])).toBe(2.5);
		expect(median([])).toBe(0);
	});
});

describe('masteryOf', () => {
	it('is not mastered without attempts', () => {
		expect(masteryOf(undefined, THRESHOLD).isMastered).toBe(false);
		expect(masteryOf(undefined, THRESHOLD).score).toBe(0);
	});

	it('needs at least five attempts', () => {
		expect(
			masteryOf(statsOf(samples(4, FAST_CLEAN)), THRESHOLD).isMastered,
		).toBe(false);
		expect(
			masteryOf(statsOf(samples(5, FAST_CLEAN)), THRESHOLD).isMastered,
		).toBe(true);
	});

	it('needs the median speed to reach the threshold', () => {
		const slow = { ms: 3 * ONE_SECOND, error: false };
		const stats = statsOf([...samples(4, slow), ...samples(3, FAST_CLEAN)]);
		const mastery = masteryOf(stats, THRESHOLD);
		expect(mastery.medianKanaPerMinute).toBe(20);
		expect(mastery.isMastered).toBe(false);
	});

	it('ignores a single abnormally long attempt thanks to the median', () => {
		const distracted = { ms: 60 * ONE_SECOND, error: false };
		const stats = statsOf([distracted, ...samples(9, FAST_CLEAN)]);
		expect(masteryOf(stats, THRESHOLD).isMastered).toBe(true);
	});

	it('tolerates one faulty attempt out of ten, none before ten', () => {
		const tenWithOneFault = statsOf([
			FAST_FAULTY,
			...samples(9, FAST_CLEAN),
		]);
		const sixWithOneFault = statsOf([
			FAST_FAULTY,
			...samples(5, FAST_CLEAN),
		]);
		expect(masteryOf(tenWithOneFault, THRESHOLD).isMastered).toBe(true);
		expect(masteryOf(sixWithOneFault, THRESHOLD).isMastered).toBe(false);
	});

	it('only judges the last ten attempts', () => {
		const stats = statsOf([
			...samples(5, FAST_FAULTY),
			...samples(10, FAST_CLEAN),
		]);
		expect(masteryOf(stats, THRESHOLD).isMastered).toBe(true);
	});

	it('cannot be mastered without any timed attempt', () => {
		const untimed = samples(10, { ms: null, error: false });
		expect(masteryOf(statsOf(untimed), THRESHOLD).isMastered).toBe(false);
	});

	it('scores the weaker of speed and accuracy', () => {
		const halfSpeed = samples(10, { ms: 4 * ONE_SECOND, error: false });
		expect(masteryOf(statsOf(halfSpeed), THRESHOLD).score).toBe(0.5);
	});

	it('keeps the score between 0 and 1 and at 1 once mastered', () => {
		const sample = fc.record({
			ms: fc.option(fc.integer({ min: 1, max: 20_000 })),
			error: fc.boolean(),
		});
		fc.assert(
			fc.property(
				fc.array(sample, { maxLength: 15 }),
				fc.integer({ min: 10, max: 150 }),
				(recent, threshold) => {
					const mastery = masteryOf(statsOf(recent), threshold);
					expect(mastery.score).toBeGreaterThanOrEqual(0);
					expect(mastery.score).toBeLessThanOrEqual(1);
					if (mastery.isMastered) {
						expect(mastery.score).toBe(1);
					}
				},
			),
		);
	});
});
