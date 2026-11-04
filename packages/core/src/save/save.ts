import type { Progress } from '../progression/schema.ts';
import type { Settings } from '../settings/schema.ts';
import { migrateToCurrent } from './migrations.ts';
import {
	CURRENT_SCHEMA_VERSION,
	HISTORY_LIMIT,
	SAVE_FORMAT,
	type SaveFile,
	SaveFileSchema,
	type SessionRecord,
} from './schema.ts';

const JSON_INDENT = 2;

export type SaveError =
	| 'invalidJson'
	| 'notASave'
	| 'unsupportedVersion'
	| 'invalidContent';

export type ParseResult =
	| { readonly ok: true; readonly save: SaveFile }
	| { readonly ok: false; readonly error: SaveError };

export interface SaveContent {
	readonly appVersion: string;
	readonly savedAt: string;
	readonly settings: Settings;
	readonly progress: Progress;
	readonly history: readonly SessionRecord[];
}

export function createSave(content: SaveContent): SaveFile {
	return {
		format: SAVE_FORMAT,
		schemaVersion: CURRENT_SCHEMA_VERSION,
		...content,
		history: content.history.slice(-HISTORY_LIMIT),
	};
}

export function serializeSave(save: SaveFile): string {
	return `${JSON.stringify(save, null, JSON_INDENT)}\n`;
}

function parseJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads stored or imported save data: checks the format, migrates older
 * versions and validates the content, never throwing (A3).
 */
export function parseSave(text: string): ParseResult {
	const data = parseJson(text);
	if (data === undefined) {
		return { ok: false, error: 'invalidJson' };
	}
	if (!isRecord(data) || data.format !== SAVE_FORMAT) {
		return { ok: false, error: 'notASave' };
	}
	const version = data.schemaVersion;
	if (typeof version !== 'number') {
		return { ok: false, error: 'invalidContent' };
	}
	const migration = migrateToCurrent(data, version);
	if (!migration.ok) {
		return { ok: false, error: migration.reason };
	}
	const parsed = SaveFileSchema.safeParse(migration.data);
	return parsed.success
		? { ok: true, save: parsed.data }
		: { ok: false, error: 'invalidContent' };
}

/** Adds a series to the light history, keeping the last 100. */
export function withSessionRecord(
	save: SaveFile,
	record: SessionRecord,
): SaveFile {
	return {
		...save,
		history: [...save.history, record].slice(-HISTORY_LIMIT),
	};
}

export interface ImportPreview {
	readonly savedAt: string;
	readonly unlockedCount: number;
	readonly sessionCount: number;
}

/** What the import confirmation shows before replacing the progress (C6). */
export function importPreviewOf(save: SaveFile): ImportPreview {
	return {
		savedAt: save.savedAt,
		unlockedCount: save.progress.unlocked.length,
		sessionCount: save.history.length,
	};
}
