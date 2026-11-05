import {
	alignProgress,
	applySeries,
	createProgress,
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

/** Records a finished series: progress, unlocking and light history. */
export function saveAfterSeries(
	save: SaveFile,
	series: { readonly record: SeriesRecord; readonly wordCount: number },
	context: SaveContext,
): SeriesUpdate {
	const measurements = measureSeries(series.record);
	const { file } = context.vocabulary;
	const outcome = applySeries(save.progress, series.record.attempts, {
		unlockOrder: file.unlockOrder,
		thresholdKanaPerMinute: save.settings.speed.kanaPerMinute,
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
