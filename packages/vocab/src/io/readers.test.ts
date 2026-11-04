import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { encode } from '@msgpack/msgpack';
import { describe, expect, it } from 'vitest';
import { firstFileOfTar } from './tar.ts';
import { readWordfreq } from './wordfreq.ts';

const TAR_BLOCK = 512;

function tarOf(content: string): Uint8Array {
	const body = new TextEncoder().encode(content);
	const header = new Uint8Array(TAR_BLOCK);
	header.set(
		new TextEncoder().encode(body.length.toString(8).padStart(11, '0')),
		124,
	);
	const archive = new Uint8Array(TAR_BLOCK * 3);
	archive.set(header);
	archive.set(body, TAR_BLOCK);
	return archive;
}

describe('readers', () => {
	it('reads the first file of a tar archive', () => {
		const content = firstFileOfTar(tarOf('{"words":[]}'));
		expect(new TextDecoder().decode(content)).toBe('{"words":[]}');
		expect(() => firstFileOfTar(new Uint8Array(TAR_BLOCK))).toThrow();
	});

	it('converts wordfreq buckets into Zipf values', () => {
		const directory = mkdtempSync(join(tmpdir(), 'wordfreq-'));
		const path = join(directory, 'ja.msgpack.gz');
		const buckets = [{ format: 'cB', version: 1 }, ['の'], [], ['犬']];
		writeFileSync(path, gzipSync(encode(buckets)));
		const zipf = readWordfreq(path);
		expect(zipf.get('の')).toBe(9);
		expect(zipf.get('犬')).toBe(8.98);
	});
});
