import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { createRandom, pickWeighted, shuffle } from './random.ts';

function sequence(values: number[]) {
	let index = 0;
	return { next: () => values[index++ % values.length] ?? 0 };
}

describe('createRandom', () => {
	it('repeats the same sequence for the same seed', () => {
		const first = createRandom(42);
		const second = createRandom(42);
		expect([first.next(), first.next()]).toEqual([
			second.next(),
			second.next(),
		]);
	});

	it('stays within [0, 1)', () => {
		fc.assert(
			fc.property(fc.integer(), (seed) => {
				const value = createRandom(seed).next();
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(1);
			}),
		);
	});
});

describe('pickWeighted', () => {
	it('picks according to the weights', () => {
		const items = ['rare', 'common'];
		const weight = (item: string) => (item === 'rare' ? 1 : 3);
		expect(pickWeighted(items, weight, sequence([0.2]))).toBe('rare');
		expect(pickWeighted(items, weight, sequence([0.3]))).toBe('common');
	});

	it('never picks an item without weight', () => {
		const weight = (item: string) => (item === 'never' ? 0 : 1);
		expect(pickWeighted(['never', 'always'], weight, sequence([0]))).toBe(
			'always',
		);
	});

	it('returns undefined for an empty list', () => {
		expect(pickWeighted([], () => 1, sequence([0.5]))).toBeUndefined();
	});
});

describe('shuffle', () => {
	it('keeps the same items', () => {
		fc.assert(
			fc.property(fc.array(fc.integer()), fc.integer(), (items, seed) => {
				const shuffled = shuffle(items, createRandom(seed));
				expect([...shuffled].sort()).toEqual([...items].sort());
			}),
		);
	});
});
