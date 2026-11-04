import { progressOf } from '@keyai/core/input';
import type { SeriesState, SeriesWord, WordStatus } from '@keyai/core/session';
import { measureSeries, type SeriesMeasurements } from '@keyai/core/stats';

export type UnitDisplayState =
	| 'typed'
	| 'faulty'
	| 'partial'
	| 'next'
	| 'pending';

export interface UnitView {
	readonly id: string;
	readonly kana: string;
	readonly state: UnitDisplayState;
}

export interface WordView {
	readonly index: number;
	readonly status: WordStatus;
	readonly units: readonly UnitView[];
}

function typedState(word: SeriesWord, unitIndex: number): UnitDisplayState {
	return word.faultyUnits.includes(unitIndex) ? 'faulty' : 'typed';
}

function currentUnitState(
	word: SeriesWord,
	unitIndex: number,
): UnitDisplayState {
	const { completedUnits, typed } = progressOf(word.matcher);
	if (unitIndex < completedUnits) {
		return typedState(word, unitIndex);
	}
	if (unitIndex > completedUnits) {
		return 'pending';
	}
	return typed === '' ? 'next' : 'partial';
}

function unitStateOf(word: SeriesWord, unitIndex: number): UnitDisplayState {
	switch (word.status) {
		case 'current':
			return currentUnitState(word, unitIndex);
		case 'done':
			return typedState(word, unitIndex);
		default:
			return word.faultyUnits.includes(unitIndex) ? 'faulty' : 'pending';
	}
}

/** What the word line shows: kana filled in place as they are typed (C8). */
export function wordViewsOf(series: SeriesState): WordView[] {
	return series.words.map((word, index) => ({
		index,
		status: word.status,
		units: word.units.map((kana, unitIndex) => ({
			id: `${index}:${unitIndex}`,
			kana,
			state: unitStateOf(word, unitIndex),
		})),
	}));
}

/** Indexes of the finished words, the most recent first (C8 recap). */
export function finishedWordIndexes(series: SeriesState): number[] {
	return series.words
		.map((word, index) => ({ word, index }))
		.filter(
			({ word }) => word.status === 'done' || word.status === 'skipped',
		)
		.map(({ index }) => index)
		.reverse();
}

export function finishedWordCount(series: SeriesState): number {
	return finishedWordIndexes(series).length;
}

/** Measurements of the series so far, for the statistics bar. */
export function liveMeasurementsOf(
	series: SeriesState,
	now: number,
): SeriesMeasurements {
	return measureSeries({
		attempts: series.attempts,
		wrongKeyCount: series.wrongKeyCount,
		elapsedMs: series.startedAt === null ? 0 : now - series.startedAt,
	});
}
