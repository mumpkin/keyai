import * as zod from 'zod';
import { ProgressSchema } from '../progression/schema.ts';
import { SettingsSchema } from '../settings/schema.ts';

export const SAVE_FORMAT = 'keyai-save';
export const CURRENT_SCHEMA_VERSION = 1;
/** Light history: one record per series, the last 100 only (A3). */
export const HISTORY_LIMIT = 100;

export const SessionRecordSchema = zod.object({
	date: zod.iso.datetime(),
	kanaPerMinute: zod.number().nonnegative(),
	accuracy: zod.number().min(0).max(1),
	wordCount: zod.number().int().nonnegative(),
	/** Kana unlocked at the end of this series. */
	unlocked: zod.array(zod.string().min(1)),
});

export const SaveFileSchema = zod.object({
	format: zod.literal(SAVE_FORMAT),
	schemaVersion: zod.literal(CURRENT_SCHEMA_VERSION),
	appVersion: zod.string().min(1),
	savedAt: zod.iso.datetime(),
	settings: SettingsSchema,
	progress: ProgressSchema,
	history: zod.array(SessionRecordSchema).max(HISTORY_LIMIT),
});

export type SessionRecord = zod.infer<typeof SessionRecordSchema>;
export type SaveFile = zod.infer<typeof SaveFileSchema>;
