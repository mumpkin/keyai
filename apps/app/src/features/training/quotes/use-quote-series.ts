import { findKana } from '@keyai/core/kana';
import {
	nextQuoteOf,
	type QuoteToken,
	quoteInKana,
	quoteSeriesOf,
	withTypedMarks,
} from '@keyai/core/quote';
import { createRandom } from '@keyai/core/random';
import {
	createSeries,
	resumeSeries,
	type SeriesAction,
	type SeriesState,
	seriesRecordOf,
	seriesReducer,
} from '@keyai/core/session';
import type { Settings } from '@keyai/core/settings';
import type { SeriesRecord } from '@keyai/core/stats';
import { useEffect, useRef, useState } from 'react';
import { seriesSummaryOf } from '@/features/statistics/model/series-summary.ts';
import { useProgressStore, useQuotes } from '@/stores/app-context.tsx';
import type { ProgressStore } from '@/stores/progress-store.ts';
import type { QuoteSeries } from '@/stores/series-types.ts';
import { useUiStore } from '@/stores/ui-store.ts';
import type { QuoteEntry } from '@/vocab/quotes.ts';

let quoteCount = 0;

function tokensFor(quote: QuoteEntry, settings: Settings): QuoteToken[] {
	const { display, typesPunctuation } = settings.quote;
	const tokens =
		display === 'kana' ? quoteInKana(quote.tokens) : quote.tokens;
	return typesPunctuation ? withTypedMarks(tokens) : [...tokens];
}

function seriesOf(quote: QuoteEntry, store: ProgressStore): QuoteSeries {
	const tokens = tokensFor(quote, store.getState().save.settings);
	const { words, typing } = quoteSeriesOf(tokens);
	quoteCount += 1;
	return {
		id: quoteCount,
		quote,
		tokens,
		state: createSeries(words, { naturalWriting: true, typing }),
	};
}

/** Punctuation is typed, but it is no kana in the statistics. */
function recordOf(finished: SeriesState): SeriesRecord {
	const record = seriesRecordOf(finished);
	return {
		...record,
		attempts: record.attempts.filter((item) => findKana(item.kana)),
	};
}

function drawnQuote(store: ProgressStore, quotes: readonly QuoteEntry[]) {
	const { seenQuotes, markQuoteSeen } = useUiStore.getState();
	const { length } = store.getState().save.settings.quote;
	const seed = Date.now() + quoteCount;
	const quote = nextQuoteOf(
		quotes,
		{ length, seen: seenQuotes },
		createRandom(seed),
	);
	markQuoteSeen(quote.id);
	return seriesOf(quote, store);
}

function resumedQuote(): QuoteSeries | null {
	const { pausedQuote } = useUiStore.getState();
	return pausedQuote
		? { ...pausedQuote, state: resumeSeries(pausedQuote.state, 0) }
		: null;
}

/**
 * Lifecycle of a quote: unlike a series of words, a finished quote stays on
 * screen until the next one or a replay is asked for.
 */
export function useQuoteSeries() {
	const store = useProgressStore();
	const quotes = useQuotes();
	const showSeriesResult = useUiStore((state) => state.showSeriesResult);
	const pauseQuote = useUiStore((state) => state.pauseQuote);
	const [series, setSeries] = useState(
		() => resumedQuote() ?? drawnQuote(store, quotes),
	);
	const latest = useRef(series);

	useEffect(() => () => pauseQuote(latest.current), [pauseQuote]);

	function replace(next: QuoteSeries) {
		latest.current = next;
		setSeries(next);
	}

	function finish(finished: SeriesState) {
		const result = store.getState().applySeriesResult({
			record: recordOf(finished),
			wordCount: finished.words.length,
			isQuote: true,
		});
		showSeriesResult(seriesSummaryOf(result, [], finished));
	}

	function dispatch(action: SeriesAction) {
		const current = latest.current;
		const state = seriesReducer(current.state, action);
		if (state.phase === 'aborted') {
			replace(drawnQuote(store, quotes));
			return;
		}
		if (state.phase === 'finished' && current.state.phase !== 'finished') {
			finish(state);
		}
		replace({ ...current, state });
	}

	return {
		series,
		dispatch,
		next: () => replace(drawnQuote(store, quotes)),
		replay: () => replace(seriesOf(latest.current.quote, store)),
	};
}
