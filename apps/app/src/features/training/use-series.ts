import { createRandom } from '@keyai/core/random';
import { generateSeries, selectionContextOf } from '@keyai/core/selection';
import {
	createSeries,
	type SeriesAction,
	type SeriesState,
	seriesRecordOf,
	seriesReducer,
} from '@keyai/core/session';
import type { VocabEntry } from '@keyai/core/vocab';
import { useRef, useState } from 'react';
import { useProgressStore, useVocabulary } from '@/stores/app-context.tsx';
import type { ProgressStore } from '@/stores/progress-store.ts';
import { useUiStore } from '@/stores/ui-store.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import { createErrorSound } from './error-sound.ts';

export interface Series {
	readonly id: number;
	readonly entries: readonly VocabEntry[];
	readonly state: SeriesState;
}

let seriesCount = 0;

function newSeries(store: ProgressStore, vocabulary: Vocabulary): Series {
	const { save } = store.getState();
	const context = selectionContextOf(
		vocabulary.entries,
		save.progress,
		save.settings.speed.kanaPerMinute,
	);
	seriesCount += 1;
	const seed = Date.now() + seriesCount;
	const entries = generateSeries(
		context,
		save.settings.wordsPerSession,
		createRandom(seed),
	);
	return {
		id: seed,
		entries,
		state: createSeries(entries.map((entry) => entry.word.kana)),
	};
}

const errorSound = createErrorSound();

/**
 * Lifecycle of the series (A4, C8): typing goes through the pure reducer;
 * a finished series is recorded and the next one starts immediately, an
 * aborted one is dropped.
 */
export function useSeries() {
	const store = useProgressStore();
	const vocabulary = useVocabulary();
	const showSeriesResult = useUiStore((state) => state.showSeriesResult);
	const [series, setSeries] = useState(() => newSeries(store, vocabulary));
	const latest = useRef(series);

	function replace(next: Series) {
		latest.current = next;
		setSeries(next);
	}

	function finish(current: Series, finished: SeriesState) {
		const result = store
			.getState()
			.applySeriesResult(
				seriesRecordOf(finished),
				current.entries.length,
			);
		showSeriesResult(result);
	}

	function dispatch(action: SeriesAction) {
		const current = latest.current;
		const state = seriesReducer(current.state, action);
		const hasNewError = state.wrongKeyCount > current.state.wrongKeyCount;
		if (hasNewError && store.getState().save.settings.feedback.sound) {
			errorSound.play();
		}
		if (state.phase === 'finished') {
			finish(current, state);
		}
		const isOver = state.phase === 'finished' || state.phase === 'aborted';
		replace(isOver ? newSeries(store, vocabulary) : { ...current, state });
	}

	return {
		series,
		dispatch,
		restart: () => replace(newSeries(store, vocabulary)),
	};
}
