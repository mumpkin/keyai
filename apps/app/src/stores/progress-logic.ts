import { applySeries, createProgress } from '@keyai/core/progression';
import {
	createSave,
	parseSave,
	type SaveError,
	type SaveFile,
	withSessionRecord,
} from '@keyai/core/save';
import { practicableKanaOf } from '@keyai/core/selection';
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
}

export function freshSave(
	context: SaveContext,
	languages: readonly string[],
): SaveFile {
	const { unlockOrder, initialUnlocked } = context.vocabulary.file;
	return createSave({
		appVersion: context.appVersion,
		savedAt: context.now.toISOString(),
		settings: defaultSettings(preferredLocale(languages)),
		progress: createProgress(unlockOrder, initialUnlocked),
		history: [],
	});
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
		return { save: freshSave(context, languages), loadIssue: null };
	}
	const parsed = parseSave(stored);
	return parsed.ok
		? { save: parsed.save, loadIssue: null }
		: { save: freshSave(context, languages), loadIssue: parsed.error };
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
	const { file, entries } = context.vocabulary;
	const outcome = applySeries(save.progress, series.record.attempts, {
		unlockOrder: file.unlockOrder,
		thresholdKanaPerMinute: save.settings.speed.kanaPerMinute,
		practicableKana: practicableKanaOf(
			entries,
			new Set(save.progress.unlocked),
		),
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
