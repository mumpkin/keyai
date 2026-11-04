import { describe, expect, it } from 'vitest';
import {
	kanaPerMinuteOf,
	kanaSpeedsOf,
	measureSeries,
	wordSpeedsOf,
} from './measure.ts';
import type { UnitAttempt } from './types.ts';

function attempt(kana: string, overrides: Partial<UnitAttempt> = {}) {
	return {
		wordIndex: 0,
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

describe('wordSpeedsOf', () => {
	it('measures each word from its timed units', () => {
		const speeds = wordSpeedsOf(
			[
				attempt('い', { durationMs: null }),
				attempt('ぬ', { durationMs: 2000 }),
				attempt('ね', { wordIndex: 1, durationMs: 1000 }),
				attempt('こ', { wordIndex: 1, durationMs: 3000 }),
			],
			2,
		);
		expect(speeds).toEqual([30, 30]);
	});

	it('has no speed for a word without timed units', () => {
		const skipped = attempt('い', { durationMs: null, skipped: true });
		expect(wordSpeedsOf([skipped], 2)).toEqual([null, null]);
	});
});

describe('kanaSpeedsOf', () => {
	it('gives the speed and accuracy of each kana, the slowest first', () => {
		const speeds = kanaSpeedsOf([
			attempt('い', { durationMs: 1000 }),
			attempt('い', { durationMs: 1000, hadError: true }),
			attempt('ぬ', { durationMs: 2000 }),
		]);
		expect(speeds).toEqual([
			{ kana: 'ぬ', kanaPerMinute: 30, accuracy: 1 },
			{ kana: 'い', kanaPerMinute: 60, accuracy: 0.5 },
		]);
	});

	it('leaves out a kana that was never timed', () => {
		const untimed = attempt('い', { durationMs: null });
		expect(kanaSpeedsOf([untimed])).toEqual([]);
	});

	it('counts a skip against accuracy, not speed', () => {
		const speeds = kanaSpeedsOf([
			attempt('い', { durationMs: 2000 }),
			attempt('い', { durationMs: null, skipped: true }),
		]);
		expect(speeds).toEqual([
			{ kana: 'い', kanaPerMinute: 30, accuracy: 0.5 },
		]);
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
