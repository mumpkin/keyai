import { describe, expect, it } from 'vitest';
import { rowStepOf } from './use-row-wheel-scroll.ts';

describe('rowStepOf', () => {
	it('moves one row per mouse notch, however long it is', () => {
		expect(rowStepOf(120)).toEqual({ rows: 1, remainderPx: 0 });
		expect(rowStepOf(-300)).toEqual({ rows: -1, remainderPx: 0 });
	});

	it('adds up small movements until they make a row', () => {
		expect(rowStepOf(20)).toEqual({ rows: 0, remainderPx: 20 });
		expect(rowStepOf(-49)).toEqual({ rows: 0, remainderPx: -49 });
	});
});
