import type { QuoteToken } from '@keyai/core/quote';
import type { SeriesState, WordStatus } from '@keyai/core/session';
import type { WordScript } from '@keyai/core/settings';
import type { KanaSpeed } from '@keyai/core/stats';
import type { VocabEntry } from '@keyai/core/vocab';
import type { QuoteEntry } from '@/vocab/quotes.ts';
import type { SeriesResult } from './progress-logic.ts';

export interface SeriesWords {
	readonly entries: readonly VocabEntry[];
	readonly state: SeriesState;
}

export interface Series extends SeriesWords {
	readonly id: number;
	readonly script: WordScript;
	/** The series just finished, kept for its recap. */
	readonly previous: SeriesWords | null;
}

export interface QuoteSeries {
	readonly id: number;
	readonly quote: QuoteEntry;
	/** The quote as it is typed: in the chosen writing, with its marks. */
	readonly tokens: readonly QuoteToken[];
	readonly state: SeriesState;
}

export interface SummaryWord {
	readonly position: number;
	readonly entry: VocabEntry;
	readonly status: WordStatus;
	readonly kanaPerMinute: number | null;
}

/** What the statistics show of the last series; it is not saved (A3). */
export interface SeriesSummary extends SeriesResult {
	readonly words: readonly SummaryWord[];
	/** The slowest first. */
	readonly kanaSpeeds: readonly KanaSpeed[];
}
