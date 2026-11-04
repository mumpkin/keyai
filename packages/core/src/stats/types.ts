/** One unit of a word as it was typed during a series. */
export interface UnitAttempt {
	/** Position in the series of the word this unit belongs to. */
	readonly wordIndex: number;
	/** Kana text of the unit ('き', 'きゃ'). */
	readonly kana: string;
	/**
	 * Time from the previous unit (or the space starting the word) to the
	 * completion of this one; `null` when it cannot be timed (first unit of a
	 * series, unit on which the word was skipped).
	 */
	readonly durationMs: number | null;
	/** At least one wrong key was typed on this unit. */
	readonly hadError: boolean;
	/** The word was skipped on this unit. */
	readonly skipped: boolean;
}

export interface SeriesRecord {
	readonly attempts: readonly UnitAttempt[];
	readonly wrongKeyCount: number;
	/** Time from the first key to the end of the series. */
	readonly elapsedMs: number;
}

export interface FaultyKana {
	readonly kana: string;
	readonly faultyAttempts: number;
}

export interface KanaSpeed {
	readonly kana: string;
	readonly kanaPerMinute: number;
	/** Clean attempts ÷ attempts, from 0 to 1. */
	readonly accuracy: number;
}

export interface SeriesMeasurements {
	readonly kanaPerMinute: number;
	/** Clean units ÷ attempted units, from 0 to 1. */
	readonly accuracy: number;
	readonly errorCount: number;
	/** The most faulty kana, most faulty first. */
	readonly faultyKana: readonly FaultyKana[];
}
