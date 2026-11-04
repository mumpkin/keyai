import { createSeries, seriesReducer } from '@keyai/core/session';
import { describe, expect, it } from 'vitest';
import {
	finishedWordIndexes,
	liveMeasurementsOf,
	wordViewsOf,
} from './series-view.ts';

function typed(words: string[], keys: string) {
	return [...keys].reduce(
		(state, key, index) =>
			seriesReducer(
				state,
				key === ' '
					? { type: 'space', at: index * 1000 }
					: { type: 'key', key, at: index * 1000 },
			),
		createSeries(words),
	);
}

function statesOf(words: string[], keys: string, wordIndex: number) {
	return wordViewsOf(typed(words, keys))[wordIndex]?.units.map(
		(unit) => unit.state,
	);
}

describe('wordViewsOf', () => {
	it('fills the units in place as they are typed', () => {
		expect(statesOf(['いぬ', 'くに'], '', 0)).toEqual(['next', 'pending']);
		expect(statesOf(['いぬ', 'くに'], 'in', 0)).toEqual([
			'typed',
			'partial',
		]);
		expect(statesOf(['いぬ', 'くに'], 'inu k', 1)).toEqual([
			'partial',
			'pending',
		]);
	});

	it('marks the units typed with a wrong key', () => {
		expect(statesOf(['いぬ'], 'ixnu', 0)).toEqual(['typed', 'faulty']);
	});
});

describe('finishedWordIndexes', () => {
	it('lists done and skipped words, the most recent first', () => {
		expect(finishedWordIndexes(typed(['い', 'ぬ', 'く'], 'i  '))).toEqual([
			1, 0,
		]);
	});
});

describe('liveMeasurementsOf', () => {
	it('measures the series so far', () => {
		const series = typed(['いぬ'], 'inu');
		expect(liveMeasurementsOf(series, 2000).kanaPerMinute).toBe(60);
		expect(liveMeasurementsOf(createSeries(['い']), 0).kanaPerMinute).toBe(
			0,
		);
	});
});
