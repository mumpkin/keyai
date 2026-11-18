import {
	alignProgress,
	applySeries,
	applySpokenSeries,
	createProgress,
	type SpokenWord,
} from '@keyai/core/progression';
import {
	createSave,
	parseSave,
	type SaveError,
	type SaveFile,
	withSessionRecord,
} from '@keyai/core/save';
import {
	defaultSettings,
	preferredLocale,
	type Settings,
} from '@keyai/core/settings';
import {
	measureSeries,
	type SeriesMeasurements,
	type SeriesRecord,
} from '@keyai/core/stats';
import type { Vocabulary } from '@/vocab/vocabulary.ts';

export interface SaveContext {
	readonly vocabulary: Vocabulary;
	readonly appVersion: string;
	readonly now: Date;
}

export interface LoadedSave {
	readonly save: SaveFile;
	/** Why the stored data could not be used, if it could not. */
	readonly loadIssue: SaveError | null;
	/** Nothing was stored yet: not even a save that could not be read. */
	readonly isFirstLaunch: boolean;
}

function blankSave(context: SaveContext, settings: Settings): SaveFile {
	const { unlockOrder, initialUnlocked } = context.vocabulary.file;
	return createSave({
		appVersion: context.appVersion,
		savedAt: context.now.toISOString(),
		settings,
		progress: createProgress(unlockOrder, initialUnlocked),
		history: [],
	});
}

export function freshSave(
	context: SaveContext,
	languages: readonly string[],
): SaveFile {
	return blankSave(context, defaultSettings(preferredLocale(languages)));
}

/**
 * Resetting erases the progress and the history, not the settings nor the
 * words kept for Anki (C6).
 */
export function saveAfterReset(save: SaveFile, context: SaveContext): SaveFile {
	return { ...blankSave(context, save.settings), ankiWords: save.ankiWords };
}

/** Matches a stored or imported save with the current vocabulary. */
export function alignedSave(save: SaveFile, context: SaveContext): SaveFile {
	const { unlockOrder, initialUnlocked } = context.vocabulary.file;
	return {
		...save,
		progress: alignProgress(save.progress, unlockOrder, initialUnlocked),
	};
}

/**
 * The stored save, or a fresh one when nothing is stored or the stored data
 * cannot be read; the app never fails to start because of its data.
 */
export function loadedSaveOf(
	stored: string | null,
	context: SaveContext,
	languages: readonly string[],
): LoadedSave {
	if (stored === null) {
		return {
			save: freshSave(context, languages),
			loadIssue: null,
			isFirstLaunch: true,
		};
	}
	const parsed = parseSave(stored);
	return {
		save: parsed.ok
			? alignedSave(parsed.save, context)
			: freshSave(context, languages),
		loadIssue: parsed.ok ? null : parsed.error,
		isFirstLaunch: false,
	};
}

export interface SeriesResult {
	readonly measurements: SeriesMeasurements;
	readonly unlockedKana: string | undefined;
}

export interface SeriesUpdate {
	readonly save: SaveFile;
	readonly result: SeriesResult;
}

export interface FinishedSeries {
	readonly record: SeriesRecord;
	readonly wordCount: number;
	/** A quote goes in the history, but leaves the progress as it is. */
	readonly isQuote?: boolean;
}

/** Records a finished series: progress, unlocking and light history. */
export function saveAfterSeries(
	save: SaveFile,
	series: FinishedSeries,
	context: SaveContext,
): SeriesUpdate {
	const measurements = measureSeries(series.record);
	const { file } = context.vocabulary;
	const outcome = series.isQuote
		? { progress: save.progress, unlockedKana: undefined }
		: applySeries(save.progress, series.record.attempts, {
				unlockOrder: file.unlockOrder,
				thresholdKanaPerMinute: save.settings.speed.kanaPerMinute,
				isRevision: save.settings.wordScript !== 'both',
			});
	const updated = withSessionRecord(
		{
			...save,
			progress: outcome.progress,
			savedAt: context.now.toISOString(),
		},
		{
			date: context.now.toISOString(),
			kanaPerMinute: measurements.kanaPerMinute,
			accuracy: measurements.accuracy,
			wordCount: series.wordCount,
			unlocked: outcome.unlockedKana ? [outcome.unlockedKana] : [],
		},
	);
	return {
		save: updated,
		result: { measurements, unlockedKana: outcome.unlockedKana },
	};
}

export interface SpokenSeriesResult {
	readonly unlockedKana: string | undefined;
	/** Reading speed: kana of the words heard, over their reading time. */
	readonly kanaPerMinute: number;
	/** Share of the words heard at the first try. */
	readonly firstTryRatio: number;
}

const MILLISECONDS_PER_MINUTE = 60_000;

function readingSpeedOf(words: readonly SpokenWord[]): number {
	let units = 0;
	let milliseconds = 0;
	for (const word of words) {
		if (word.readingMs !== null && !word.skipped) {
			units += word.units.length;
			milliseconds += word.readingMs;
		}
	}
	return milliseconds === 0
		? 0
		: (units * MILLISECONDS_PER_MINUTE) / milliseconds;
}

/** Records a series read aloud: speaking statistics, unlocking, history (C9). */
export function saveAfterSpokenSeries(
	save: SaveFile,
	words: readonly SpokenWord[],
	context: SaveContext,
): { readonly save: SaveFile; readonly result: SpokenSeriesResult } {
	const outcome = applySpokenSeries(save.progress, words, {
		unlockOrder: context.vocabulary.file.unlockOrder,
		thresholdKanaPerMinute: save.settings.speed.kanaPerMinute,
		isRevision: save.settings.wordScript !== 'both',
	});
	const firstTry = words.filter(
		(word) => word.heardFirstTry && !word.skipped,
	);
	const result: SpokenSeriesResult = {
		unlockedKana: outcome.unlockedKana,
		kanaPerMinute: readingSpeedOf(words),
		firstTryRatio: words.length === 0 ? 0 : firstTry.length / words.length,
	};
	const updated = withSessionRecord(
		{
			...save,
			progress: outcome.progress,
			savedAt: context.now.toISOString(),
		},
		{
			date: context.now.toISOString(),
			kanaPerMinute: result.kanaPerMinute,
			accuracy: result.firstTryRatio,
			wordCount: words.length,
			unlocked: outcome.unlockedKana ? [outcome.unlockedKana] : [],
			input: 'voice',
		},
	);
	return { save: updated, result };
}

export function saveWithSettings(
	save: SaveFile,
	settings: Settings,
	now: Date,
): SaveFile {
	return { ...save, settings, savedAt: now.toISOString() };
}

export function saveWithAnkiWords(
	save: SaveFile,
	ankiWords: readonly string[],
	now: Date,
): SaveFile {
	return { ...save, ankiWords: [...ankiWords], savedAt: now.toISOString() };
}
