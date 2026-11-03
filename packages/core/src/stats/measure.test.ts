import { describe, expect, it } from 'vitest';
import { kanaPerMinuteOf, measureSeries } from './measure.ts';
import type { UnitAttempt } from './types.ts';

function attempt(kana: string, overrides: Partial<UnitAttempt> = {}) {
	return {
		kana,
		durationMs: 1000,
		hadError: false,
		skipped: false,
		...overrides,
	};
}

describe('kanaPerMinuteOf', () => {
	it('converts a duration into a speed', () => {
		expect(kanaPerMinuteOf(2000)).toBe(30);
		expect(kanaPerMinuteOf(0)).toBe(0);
	});
});

describe('measureSeries', () => {
	it('measures speed on completed units over the elapsed time', () => {
		const measurements = measureSeries({
			attempts: [
				attempt('い'),
				attempt('ぬ'),
				attempt('ね', { skipped: true }),
			],
			wrongKeyCount: 0,
			elapsedMs: 4000,
		});
		expect(measurements.kanaPerMinute).toBe(30);
	});

	it('counts corrected errors and skips against accuracy', () => {
		const measurements = measureSeries({
			attempts: [
				attempt('い'),
				attempt('ぬ', { hadError: true }),
				attempt('ね', { skipped: true }),
				attempt('こ'),
			],
			wrongKeyCount: 3,
			elapsedMs: 4000,
		});
		expect(measurements.accuracy).toBe(0.5);
		expect(measurements.errorCount).toBe(3);
	});

	it('lists at most five faulty kana, most faulty first', () => {
		const faulty = (kana: string) => attempt(kana, { hadError: true });
		const measurements = measureSeries({
			attempts: [
				'あ',
				'い',
				'う',
				'え',
				'お',
				'か',
				'い',
				'う',
				'い',
			].map(faulty),
			wrongKeyCount: 9,
			elapsedMs: 1000,
		});
		expect(measurements.faultyKana).toHaveLength(5);
		expect(measurements.faultyKana[0]).toEqual({
			kana: 'い',
			faultyAttempts: 3,
		});
	});

	it('handles an empty series', () => {
		expect(
			measureSeries({ attempts: [], wrongKeyCount: 0, elapsedMs: 0 }),
		).toEqual({
			kanaPerMinute: 0,
			accuracy: 0,
			errorCount: 0,
			faultyKana: [],
		});
	});
});
