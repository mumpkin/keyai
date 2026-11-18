import type { SpokenWord } from '@keyai/core/progression';
import { isHeard } from '@keyai/core/speech';
import type { VocabEntry } from '@keyai/core/vocab';

/** Where the current word stands. */
export type ListeningPhase = 'preparing' | 'listening' | 'hearing';

/** A series read aloud (C9). Plain data: every change returns a new one. */
export interface SpokenSeries {
	readonly id: number;
	readonly entries: readonly VocabEntry[];
	/** The words already ended, in order. */
	readonly words: readonly SpokenWord[];
	readonly phase: ListeningPhase;
	/** What was heard at the last try of the current word, if it was wrong. */
	readonly lastHeard: string | null;
	/** Tries of the current word that were not heard. */
	readonly misses: number;
}

export function createSpokenSeries(
	id: number,
	entries: readonly VocabEntry[],
): SpokenSeries {
	return {
		id,
		entries,
		words: [],
		phase: 'preparing',
		lastHeard: null,
		misses: 0,
	};
}

export function currentEntryOf(series: SpokenSeries): VocabEntry | undefined {
	return series.entries[series.words.length];
}

export function isFinished(series: SpokenSeries): boolean {
	return series.words.length >= series.entries.length;
}

/** The spellings the recognizer is told to expect: kana and kanji. */
export function hintsOf(entry: VocabEntry): string[] {
	const kanji = entry.word.senses.flatMap((sense) => sense.kanji ?? []);
	return [...new Set([entry.word.kana, ...kanji])];
}

function withEndedWord(series: SpokenSeries, word: SpokenWord): SpokenSeries {
	return {
		...series,
		words: [...series.words, word],
		phase: 'preparing',
		lastHeard: null,
		misses: 0,
	};
}

/** The recognizer is ready for the current word. */
export function withReady(series: SpokenSeries): SpokenSeries {
	return { ...series, phase: 'listening' };
}

export function withSpeechStarted(series: SpokenSeries): SpokenSeries {
	return series.phase === 'listening'
		? { ...series, phase: 'hearing' }
		: series;
}

/**
 * The recognizer answered. The expected word ends the try; anything else
 * stays on screen and the word can be said again. Only the first try is
 * timed: a retry would measure the hesitation, not the reading.
 */
export function withHeard(
	series: SpokenSeries,
	text: string,
	readingMs: number | null,
): SpokenSeries {
	const entry = currentEntryOf(series);
	if (!entry || series.phase === 'preparing') {
		return series;
	}
	if (!isHeard(text, entry.word.kana, hintsOf(entry))) {
		return {
			...series,
			phase: 'listening',
			lastHeard: text,
			misses: series.misses + 1,
		};
	}
	const isFirstTry = series.misses === 0;
	return withEndedWord(series, {
		units: entry.units,
		heardFirstTry: isFirstTry,
		skipped: false,
		readingMs: isFirstTry ? readingMs : null,
	});
}

/** Space: the word is skipped, and the series will unlock nothing. */
export function withSkipped(series: SpokenSeries): SpokenSeries {
	const entry = currentEntryOf(series);
	if (!entry) {
		return series;
	}
	return withEndedWord(series, {
		units: entry.units,
		heardFirstTry: false,
		skipped: true,
		readingMs: null,
	});
}
