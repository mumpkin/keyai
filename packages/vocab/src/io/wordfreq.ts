import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { decode } from '@msgpack/msgpack';

const CENTIBELS_PER_BEL = 100;
const ZIPF_OFFSET = 9;

/**
 * Reads a wordfreq "cB" pack: after a header, bucket k lists the words whose
 * frequency is 10^(-(k - 1) / 100). Returns Zipf values (log10 of the
 * frequency per billion words).
 */
export function readWordfreq(path: string): Map<string, number> {
	const [header, ...buckets] = decode(
		gunzipSync(readFileSync(path)),
	) as unknown[];
	if ((header as { format?: string } | undefined)?.format !== 'cB') {
		throw new Error(`Unexpected wordfreq file: ${path}`);
	}
	const zipfByWord = new Map<string, number>();
	for (const [index, bucket] of buckets.entries()) {
		for (const word of bucket as string[]) {
			zipfByWord.set(word, ZIPF_OFFSET - index / CENTIBELS_PER_BEL);
		}
	}
	return zipfByWord;
}
