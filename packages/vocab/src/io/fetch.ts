import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
	CACHE_DIRECTORY,
	cachedPathOf,
	readSources,
	type Source,
} from './sources.ts';

function sha256Of(content: Uint8Array): string {
	return createHash('sha256').update(content).digest('hex');
}

function isCached(source: Source): boolean {
	const path = cachedPathOf(source);
	return existsSync(path) && sha256Of(readFileSync(path)) === source.sha256;
}

async function download(source: Source): Promise<void> {
	const response = await fetch(source.url);
	if (!response.ok) {
		throw new Error(`Download failed (${response.status}): ${source.url}`);
	}
	const content = new Uint8Array(await response.arrayBuffer());
	const checksum = sha256Of(content);
	if (checksum !== source.sha256) {
		throw new Error(
			`Checksum mismatch for ${source.file}: expected ${source.sha256}, got ${checksum}`,
		);
	}
	writeFileSync(cachedPathOf(source), content);
}

/** Downloads the pinned sources into the cache, verifying their checksum. */
export async function fetchSources(): Promise<void> {
	mkdirSync(CACHE_DIRECTORY, { recursive: true });
	for (const [name, source] of Object.entries(readSources())) {
		if (isCached(source)) {
			console.log(`✓ ${name} ${source.version} (cached)`);
		} else {
			await download(source);
			console.log(`↓ ${name} ${source.version}`);
		}
	}
}
