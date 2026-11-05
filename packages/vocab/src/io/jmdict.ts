import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { firstFileOfTar } from './tar.ts';

interface JmdictGloss {
	readonly lang: string;
	readonly text: string;
}

export interface JmdictSense {
	readonly partOfSpeech: readonly string[];
	readonly misc: readonly string[];
	readonly info: readonly string[];
	readonly gloss: readonly JmdictGloss[];
}

export interface JmdictForm {
	readonly text: string;
	readonly common: boolean;
	readonly tags: readonly string[];
}

export interface JmdictWord {
	readonly id: string;
	readonly kanji: readonly JmdictForm[];
	readonly kana: readonly JmdictForm[];
	readonly sense: readonly JmdictSense[];
}

interface JmdictFile {
	readonly version: string;
	readonly words: readonly JmdictWord[];
}

/** Reads the jmdict-simplified archive (gzipped tar holding one JSON file). */
export function readJmdict(path: string): JmdictFile {
	const json = firstFileOfTar(gunzipSync(readFileSync(path)));
	const data = JSON.parse(new TextDecoder().decode(json)) as JmdictFile;
	if (typeof data.version !== 'string' || !Array.isArray(data.words)) {
		throw new Error(`Unexpected JMdict file: ${path}`);
	}
	return data;
}
