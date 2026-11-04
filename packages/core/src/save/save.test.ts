import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../settings/settings.ts';
import { migrateToCurrent } from './migrations.ts';
import {
	createSave,
	importPreviewOf,
	parseSave,
	saveFileNameOf,
	serializeSave,
	withSessionRecord,
} from './save.ts';

const NOW = '2026-11-04T10:00:00.000Z';
const RECORD = {
	date: NOW,
	kanaPerMinute: 42,
	accuracy: 0.94,
	wordCount: 20,
	unlocked: ['く'],
};
const SAVE = createSave({
	appVersion: '0.1.0',
	savedAt: NOW,
	settings: defaultSettings('fr'),
	progress: {
		unlocked: ['い', 'の'],
		kana: Object.fromEntries([
			[
				'い',
				{ seen: 1, errors: 0, recent: [{ ms: null, error: false }] },
			],
		]),
	},
	history: [RECORD],
});

describe('save', () => {
	it('round-trips through serialisation', () => {
		expect(parseSave(serializeSave(SAVE))).toEqual({
			ok: true,
			save: SAVE,
		});
	});

	it.each([
		['not json', 'invalidJson'],
		['[1, 2]', 'notASave'],
		['{"format": "other"}', 'notASave'],
		['{"format": "keyai-save"}', 'invalidContent'],
		['{"format": "keyai-save", "schemaVersion": 99}', 'unsupportedVersion'],
	])('rejects %s', (text, error) => {
		expect(parseSave(text)).toEqual({ ok: false, error });
	});

	it('rejects a save with an invalid content', () => {
		const tampered = { ...SAVE, progress: { unlocked: 'い', kana: {} } };
		expect(parseSave(JSON.stringify(tampered))).toEqual({
			ok: false,
			error: 'invalidContent',
		});
	});

	it('keeps only the last 100 series in the history', () => {
		let save = SAVE;
		for (let index = 0; index < 120; index += 1) {
			save = withSessionRecord(save, { ...RECORD, wordCount: index });
		}
		expect(save.history).toHaveLength(100);
		expect(save.history.at(-1)?.wordCount).toBe(119);
	});

	it('previews an import', () => {
		expect(importPreviewOf(SAVE)).toEqual({
			savedAt: NOW,
			unlockedCount: 2,
			sessionCount: 1,
		});
	});
});

describe('migrateToCurrent', () => {
	it('applies every migration from an older version', () => {
		const migrations = new Map([
			[
				1,
				(data: Record<string, unknown>) => ({
					...data,
					upgraded: true,
				}),
			],
		]);
		expect(migrateToCurrent({ legacy: 1 }, 1, migrations)).toEqual({
			ok: true,
			data: { legacy: 1, upgraded: true, schemaVersion: 2 },
		});
	});

	it('adds the theme to a save of version 1', () => {
		const { display } = SAVE.settings;
		const version1 = {
			...SAVE,
			schemaVersion: 1,
			settings: {
				...SAVE.settings,
				display: { kanaSizePx: display.kanaSizePx },
			},
		};
		expect(parseSave(JSON.stringify(version1))).toEqual({
			ok: true,
			save: SAVE,
		});
	});

	it('still rejects a damaged save of version 1', () => {
		const damaged = { ...SAVE, schemaVersion: 1, settings: undefined };
		expect(parseSave(JSON.stringify(damaged))).toEqual({
			ok: false,
			error: 'invalidContent',
		});
	});

	it('refuses a version without a migration path', () => {
		expect(migrateToCurrent({}, 0)).toEqual({
			ok: false,
			reason: 'unsupportedVersion',
		});
	});
});

describe('saveFileNameOf', () => {
	it('names the export after its day', () => {
		expect(saveFileNameOf(new Date('2026-11-04T12:00:00.000Z'))).toBe(
			'keyai-save-2026-11-04.json',
		);
	});
});
