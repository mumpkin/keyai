import { createRandom } from '@keyai/core/random';
import { generateSeries, selectionContextOf } from '@keyai/core/selection';
import { type RefObject, useEffect, useRef, useState } from 'react';
import type { SpeechEngine } from '@/features/speech/speech-engine.ts';
import { useSpeechStore } from '@/features/speech/speech-store.ts';
import { useProgressStore, useVocabulary } from '@/stores/app-context.tsx';
import type { SpokenSeriesResult } from '@/stores/progress-logic.ts';
import type { ProgressStore } from '@/stores/progress-store.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import {
	createSpokenSeries,
	currentEntryOf,
	hintsOf,
	isFinished,
	type SpokenSeries,
	withHeard,
	withReady,
	withSkipped,
	withSpeechStarted,
} from './spoken-series.ts';

let seriesCount = 0;

function newSeries(store: ProgressStore, vocabulary: Vocabulary): SpokenSeries {
	const { save } = store.getState();
	const context = selectionContextOf(vocabulary.entries, save.progress, {
		thresholdKanaPerMinute: save.settings.speed.kanaPerMinute,
		script: save.settings.wordScript,
		input: 'voice',
	});
	seriesCount += 1;
	const seed = Date.now() + seriesCount;
	const entries = generateSeries(
		context,
		save.settings.wordsPerSession,
		createRandom(seed),
	);
	return createSpokenSeries(seed, entries);
}

function messageOf(cause: unknown): string {
	return cause instanceof Error ? cause.message : String(cause);
}

interface Listening {
	readonly onSpeechStarted: () => void;
	readonly onHeard: (text: string) => void;
}

/** One microphone for the whole series screen. */
function useMicrophone(
	engine: SpeechEngine,
	handlers: RefObject<Listening>,
	onError: (message: string) => void,
) {
	useEffect(() => {
		let stop: (() => void) | undefined;
		let isClosed = false;
		engine
			.listen({
				onSpeechStarted: () => handlers.current.onSpeechStarted(),
				onHeard: (text) => handlers.current.onHeard(text),
			})
			.then((close) => {
				if (isClosed) {
					close();
				} else {
					stop = close;
				}
			})
			.catch((cause: unknown) => onError(messageOf(cause)));
		return () => {
			isClosed = true;
			stop?.();
		};
	}, [engine, handlers, onError]);
}

interface PreparationCallbacks {
	readonly onReady: (id: number, position: number) => void;
	readonly onError: (message: string) => void;
}

/**
 * Rebuilds the recognizer for each word (about a second). Keyed on the
 * position, as the same word can come twice in a row.
 */
function usePreparation(
	engine: SpeechEngine,
	series: SpokenSeries,
	{ onReady, onError }: PreparationCallbacks,
) {
	const position = series.words.length;
	const entry = currentEntryOf(series);
	useEffect(() => {
		if (!entry) {
			return;
		}
		engine
			.prepare(hintsOf(entry))
			.then(() => onReady(series.id, position))
			.catch((cause: unknown) => onError(messageOf(cause)));
	}, [engine, entry, position, series.id, onReady, onError]);
}

/** The series on screen; a finished one is recorded and replaced. */
function useSeriesState(onFinished: (result: SpokenSeriesResult) => void) {
	const store = useProgressStore();
	const vocabulary = useVocabulary();
	const [series, setSeries] = useState(() => newSeries(store, vocabulary));
	const latest = useRef(series);
	const show = (next: SpokenSeries) => {
		latest.current = next;
		setSeries(next);
	};
	const update = (next: SpokenSeries) => {
		if (isFinished(next) && next.entries.length > 0) {
			onFinished(store.getState().applySpokenSeriesResult(next.words));
			show(newSeries(store, vocabulary));
		} else {
			show(next);
		}
	};
	return {
		series,
		latest,
		show,
		update,
		restart: () => show(newSeries(store, vocabulary)),
	};
}

/**
 * A series read aloud (C9): each word is prepared, then the microphone
 * listens until the recognizer hears it. Space skips a word; a finished
 * series is recorded and the next one starts.
 */
export function useSpokenSeries(
	onFinished: (result: SpokenSeriesResult) => void,
) {
	const engine = useSpeechStore((state) => state.engine);
	const { series, latest, show, update, restart } =
		useSeriesState(onFinished);
	const [error, setError] = useState<string | null>(null);
	const readyAt = useRef<number | null>(null);

	const handlers = useRef<Listening>({
		onSpeechStarted: () => undefined,
		onHeard: () => undefined,
	});
	handlers.current = {
		onSpeechStarted: () => update(withSpeechStarted(latest.current)),
		onHeard: (text) => {
			const elapsed =
				readyAt.current === null
					? null
					: performance.now() - readyAt.current;
			update(withHeard(latest.current, text, elapsed));
		},
	};

	const [onReady] = useState(() => (id: number, position: number) => {
		const current = latest.current;
		if (current.id === id && current.words.length === position) {
			readyAt.current = performance.now();
			show(withReady(current));
		}
	});

	useMicrophone(engine, handlers, setError);
	usePreparation(engine, series, { onReady, onError: setError });

	return {
		series,
		error,
		skip: () => {
			readyAt.current = null;
			update(withSkipped(latest.current));
		},
		restart: () => {
			readyAt.current = null;
			restart();
		},
	};
}
