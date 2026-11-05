import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as zod from 'zod';

const SourceSchema = zod.object({
	version: zod.string().min(1),
	url: zod.url(),
	file: zod.string().min(1),
	sha256: zod.string().regex(/^[0-9a-f]{64}$/),
});

const SourcesSchema = zod.object({
	jmdict: SourceSchema,
	wordfreq: SourceSchema,
});

export type Source = zod.infer<typeof SourceSchema>;
export type Sources = zod.infer<typeof SourcesSchema>;

const PACKAGE_DIRECTORY = fileURLToPath(new URL('../../', import.meta.url));
export const CACHE_DIRECTORY = `${PACKAGE_DIRECTORY}.cache/`;
export const VOCABULARY_FILE = `${PACKAGE_DIRECTORY}data/vocab.json`;
export const REPORT_FILE = `${PACKAGE_DIRECTORY}report.md`;
export const OVERRIDES_FILE = `${PACKAGE_DIRECTORY}overrides/words.yaml`;

export function readSources(): Sources {
	const text = readFileSync(`${PACKAGE_DIRECTORY}sources.json`, 'utf8');
	return SourcesSchema.parse(JSON.parse(text));
}

export function cachedPathOf(source: Source): string {
	return `${CACHE_DIRECTORY}${source.file}`;
}
