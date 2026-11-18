import { describe, expect, it } from 'vitest';
import { createResampler } from './resampler.ts';

function ramp(length: number, start = 0): Float32Array {
	return Float32Array.from({ length }, (_, index) => start + index);
}

describe('createResampler', () => {
	it('keeps one sample in three from 48 kHz to 16 kHz', () => {
		const resample = createResampler(48_000, 16_000);
		expect(Array.from(resample(ramp(12)))).toEqual([0, 3, 6, 9]);
	});

	it('interpolates between samples when the ratio is not whole', () => {
		const resample = createResampler(44_100, 16_000);
		const output = resample(ramp(4410));
		expect(output.length).toBeGreaterThan(1590);
		expect(output.length).toBeLessThanOrEqual(1600);
		expect(output[1]).toBeCloseTo(44_100 / 16_000, 4);
	});

	it('leaves no gap between two chunks', () => {
		const whole = createResampler(48_000, 16_000)(ramp(24));
		const resample = createResampler(48_000, 16_000);
		const split = [...resample(ramp(10)), ...resample(ramp(14, 10))];
		expect(split).toEqual(Array.from(whole));
	});

	it('passes samples through at the same rate', () => {
		const resample = createResampler(16_000, 16_000);
		expect(Array.from(resample(ramp(5)))).toEqual([0, 1, 2, 3]);
		expect(Array.from(resample(ramp(3, 5)))).toEqual([4, 5, 6]);
	});
});
