import { parseSave, serializeSave } from '@keyai/core/save';
import { withKanaPerMinute } from '@keyai/core/settings';
import type { UnitAttempt } from '@keyai/core/stats';
import { describe, expect, it } from 'vitest';
import { vocabularyOf } from '@/vocab/vocabulary.ts';
import {
	freshSave,
	loadedSaveOf,
	type SaveContext,
	saveAfterReset,
	saveAfterSeries,
	saveWithAnkiWords,
	saveWithSettings,
} from './progress-logic.ts';

const ONE_SECOND = 1000;

function wordOf(id: string, kana: string, rank: number) {
	return { id, kana, rank, senses: [{ gloss: { en: id }, pos: ['noun'] }] };
}

const CONTEXT: SaveContext = {
	appVersion: '0.1.0',
	now: new Date('2026-11-04T12:00:00.000Z'),
	vocabulary: vocabularyOf({
		schemaVersion: 1,
		sources: { jmdict: 'test', wordfreq: 'test' },
		unlockOrder: ['い', 'ぬ', 'く', 'テ', 'ス'],
		initialUnlocked: 2,
		words: [wordOf('dog', 'いぬ', 1), wordOf('place', 'いく', 2)],
	}),
};

function cleanAttempts(kana: string, count: number): UnitAttempt[] {
	return Array.from({ length: count }, () => ({
		wordIndex: 0,
		kana,
		durationMs: ONE_SECOND,
		hadError: false,
		skipped: false,
	}));
}

describe('saveAfterReset', () => {
	it('erases the progress and the history but keeps the settings', () => {
		const save = freshSave(CONTEXT, ['fr']);
		const settings = withKanaPerMinute(save.settings, 70);
		const trained = saveAfterSeries(
			{ ...save, settings },
			{
				record: {
					attempts: cleanAttempts('い', 10),
					wrongKeyCount: 0,
					elapsedMs: 10 * ONE_SECOND,
				},
				wordCount: 5,
			},
			CONTEXT,
		).save;

		const reset = saveAfterReset(trained, CONTEXT);

		expect(trained.history).toHaveLength(1);
		expect(reset.history).toEqual([]);
		expect(reset.progress).toEqual(save.progress);
		expect(reset.settings).toEqual(settings);
	});
});

describe('loadedSaveOf', () => {
	it('starts a fresh save in the browser language', () => {
		const loaded = loadedSaveOf(null, CONTEXT, ['en-US']);
		expect(loaded.loadIssue).toBeNull();
		expect(loaded.isFirstLaunch).toBe(true);
		expect(loaded.save.settings.locale).toBe('en');
		expect(loaded.save.progress.unlocked).toEqual(['い', 'ぬ']);
		expect(loaded.save.history).toEqual([]);
	});

	it('is not a first launch once something is stored', () => {
		const stored = serializeSave(freshSave(CONTEXT, ['fr']));
		expect(loadedSaveOf(stored, CONTEXT, ['fr']).isFirstLaunch).toBe(false);
		expect(loadedSaveOf('broken', CONTEXT, ['fr']).isFirstLaunch).toBe(
			false,
		);
	});

	it('reads a stored save', () => {
		const stored = serializeSave(freshSave(CONTEXT, ['fr']));
		expect(loadedSaveOf(stored, CONTEXT, ['en']).save.settings.locale).toBe(
			'fr',
		);
	});

	it('aligns a stored save with the unlock order', () => {
		const stale = freshSave(CONTEXT, ['fr']);
		const stored = serializeSave({
			...stale,
			progress: { ...stale.progress, unlocked: ['い', 'く'] },
		});
		expect(
			loadedSaveOf(stored, CONTEXT, ['fr']).save.progress.unlocked,
		).toEqual(['い', 'ぬ', 'く']);
	});

	it('starts fresh and reports why when the stored data is unreadable', () => {
		const loaded = loadedSaveOf('{broken', CONTEXT, ['fr']);
		expect(loaded.loadIssue).toBe('invalidJson');
		expect(loaded.save.progress.unlocked).toEqual(['い', 'ぬ']);
	});
});

describe('saveAfterSeries', () => {
	const save = freshSave(CONTEXT, ['fr']);
	const record = {
		attempts: [...cleanAttempts('い', 5), ...cleanAttempts('ぬ', 5)],
		wrongKeyCount: 0,
		elapsedMs: 10 * ONE_SECOND,
	};

	it('records the series, unlocks the next kana and keeps the history', () => {
		const update = saveAfterSeries(save, { record, wordCount: 5 }, CONTEXT);
		expect(update.result.unlockedKana).toBe('く');
		expect(update.result.measurements.kanaPerMinute).toBe(60);
		expect(update.save.progress.unlocked).toEqual(['い', 'ぬ', 'く']);
		expect(update.save.history).toEqual([
			{
				date: '2026-11-04T12:00:00.000Z',
				kanaPerMinute: 60,
				accuracy: 1,
				wordCount: 5,
				unlocked: ['く'],
			},
		]);
		expect(parseSave(serializeSave(update.save)).ok).toBe(true);
	});

	it('uses the speed threshold of the settings', () => {
		const demanding = saveWithSettings(
			save,
			withKanaPerMinute(save.settings, 120),
			CONTEXT.now,
		);
		const update = saveAfterSeries(
			demanding,
			{ record, wordCount: 5 },
			CONTEXT,
		);
		expect(update.result.unlockedKana).toBeUndefined();
	});

	it('waits until every unlocked kana is mastered', () => {
		const attempts = cleanAttempts('い', 5);
		const update = saveAfterSeries(
			save,
			{ record: { ...record, attempts }, wordCount: 5 },
			CONTEXT,
		);
		expect(update.result.unlockedKana).toBeUndefined();
	});
});

describe('the Anki list', () => {
	it('survives a reset of the progress', () => {
		const save = saveWithAnkiWords(
			freshSave(CONTEXT, ['fr']),
			['1'],
			CONTEXT.now,
		);
		expect(saveAfterReset(save, CONTEXT).ankiWords).toEqual(['1']);
	});
});
