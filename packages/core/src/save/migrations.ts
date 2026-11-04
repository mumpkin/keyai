import { CURRENT_SCHEMA_VERSION } from './schema.ts';

export type Migration = (
	data: Record<string, unknown>,
) => Record<string, unknown>;

/** Version 2 adds the theme; content that is not valid is left to the schema. */
function addTheme(data: Record<string, unknown>): Record<string, unknown> {
	const settings = data.settings as Record<string, unknown> | undefined;
	const display = settings?.display as Record<string, unknown> | undefined;
	return {
		...data,
		settings: { ...settings, display: { ...display, theme: 'system' } },
	};
}

/**
 * Upgrades from version `n` to `n + 1`, keyed by `n`. Add one entry for
 * every new schema version; never edit a published one.
 */
const MIGRATIONS: ReadonlyMap<number, Migration> = new Map([[1, addTheme]]);

export type MigrationResult =
	| { readonly ok: true; readonly data: Record<string, unknown> }
	| { readonly ok: false; readonly reason: 'unsupportedVersion' };

/** Brings save data of any known version to the current version. */
export function migrateToCurrent(
	data: Record<string, unknown>,
	version: number,
	migrations: ReadonlyMap<number, Migration> = MIGRATIONS,
): MigrationResult {
	let migrated = data;
	for (let from = version; from < CURRENT_SCHEMA_VERSION; from += 1) {
		const migration = migrations.get(from);
		if (!migration) {
			return { ok: false, reason: 'unsupportedVersion' };
		}
		migrated = { ...migration(migrated), schemaVersion: from + 1 };
	}
	return version > CURRENT_SCHEMA_VERSION
		? { ok: false, reason: 'unsupportedVersion' }
		: { ok: true, data: migrated };
}
