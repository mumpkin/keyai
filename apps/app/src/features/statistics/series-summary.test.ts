import { createSeries, seriesReducer } from '@keyai/core/session';
import type { VocabEntry } from '@keyai/core/vocab';
import { describe, expect, it } from 'vitest';
import { seriesSummaryOf } from './series-summary.ts';

const RESULT = {
	measurements: {
		kanaPerMinute: 30,
		accuracy: 1,
		errorCount: 0,
		faultyKana: [],
	},
	unlockedKana: undefined,
};

function entryOf(kana: string) {
	return { word: { kana } } as VocabEntry;
}

function typed(keys: string, words: readonly string[]) {
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

describe('seriesSummaryOf', () => {
	it('gives each word its status and speed', () => {
		const words = ['いぬ', 'くに'];
		const summary = seriesSummaryOf(
			RESULT,
			words.map(entryOf),
			typed('inu kuni', words),
		);
		expect(summary.words.map((word) => word.position)).toEqual([1, 2]);
		expect(summary.words.map((word) => word.status)).toEqual([
			'done',
			'done',
		]);
		expect(summary.words[1]?.kanaPerMinute).toBeGreaterThan(0);
	});

	it('marks a skipped word, which has no speed', () => {
		const words = ['いぬ', 'くに'];
		const summary = seriesSummaryOf(
			RESULT,
			words.map(entryOf),
			typed('i ', words),
		);
		expect(summary.words[0]?.status).toBe('skipped');
		expect(summary.words[0]?.kanaPerMinute).toBeNull();
	});
});
