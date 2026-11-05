import { createRandom } from '@keyai/core/random';
import { generateSeries, selectionContextOf } from '@keyai/core/selection';
import {
	createSeries,
	resumeSeries,
	type SeriesAction,
	type SeriesState,
	seriesRecordOf,
	seriesReducer,
} from '@keyai/core/session';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { seriesSummaryOf } from '@/features/statistics/model/series-summary.ts';
import { useProgressStore, useVocabulary } from '@/stores/app-context.tsx';
import type { ProgressStore } from '@/stores/progress-store.ts';
import { useUiStore } from '@/stores/ui-store.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import { createErrorSound } from './error-sound.ts';
import type { Series, SeriesWords } from './series-view.ts';

let seriesCount = 0;

function newSeries(
	store: ProgressStore,
	vocabulary: Vocabulary,
	previous: SeriesWords | null = null,
): Series {
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
		state: createSeries(
			entries.map((entry) => entry.word.kana),
			{ naturalWriting: save.settings.naturalWriting },
		),
		previous,
	};
}

/** The series left for another screen, unless the settings no longer fit. */
function pausedSeriesFor(store: ProgressStore): Series | null {
	const { pausedSeries } = useUiStore.getState();
	const { wordsPerSession, naturalWriting } = store.getState().save.settings;
	if (
		pausedSeries?.series.entries.length !== wordsPerSession ||
		pausedSeries.series.state.naturalWriting !== naturalWriting
	) {
		return null;
	}
	const { series, pausedAt } = pausedSeries;
	const awayMs = performance.now() - pausedAt;
	return { ...series, state: resumeSeries(series.state, awayMs) };
}

/** Keeps a series being typed for the return to the training screen. */
function usePauseOnLeaving(latest: RefObject<Series>) {
	const pauseSeries = useUiStore((state) => state.pauseSeries);
	useEffect(
		() => () => {
			const current = latest.current;
			pauseSeries(
				current.state.phase === 'typing'
					? { series: current, pausedAt: performance.now() }
					: null,
			);
		},
		[latest, pauseSeries],
	);
}

const errorSound = createErrorSound();

/**
 * Lifecycle of the series (A4, C8): typing goes through the pure reducer;
 * a finished series is recorded and the next one starts immediately, an
 * aborted one is dropped, and one left for another screen is taken back.
 */
export function useSeries() {
	const store = useProgressStore();
	const vocabulary = useVocabulary();
	const showSeriesResult = useUiStore((state) => state.showSeriesResult);
	const [series, setSeries] = useState(
		() => pausedSeriesFor(store) ?? newSeries(store, vocabulary),
	);
	const latest = useRef(series);

	usePauseOnLeaving(latest);

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
		showSeriesResult(seriesSummaryOf(result, current.entries, finished));
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
			const { entries } = current;
			replace(newSeries(store, vocabulary, { entries, state }));
		} else if (state.phase === 'aborted') {
			replace(newSeries(store, vocabulary));
		} else {
			replace({ ...current, state });
		}
	}

	return {
		series,
		dispatch,
		restart: () => replace(newSeries(store, vocabulary)),
	};
}
