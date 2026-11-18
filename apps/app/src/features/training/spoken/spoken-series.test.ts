import { entryOf, type VocabEntry } from '@keyai/core/vocab';
import { describe, expect, it } from 'vitest';
import {
	createSpokenSeries,
	hintsOf,
	isFinished,
	withHeard,
	withReady,
	withSkipped,
	withSpeechStarted,
} from './spoken-series.ts';

function entry(kana: string, kanji?: string): VocabEntry {
	const made = entryOf({
		id: kana,
		kana,
		rank: 1,
		senses: [
			{ gloss: { en: kana }, pos: ['noun'], ...(kanji && { kanji }) },
		],
	});
	if (!made) {
		throw new Error(kana);
	}
	return made;
}

const SCHOOL = entry('がっこう', '学校');
const TEACHER = entry('せんせい', '先生');

function ready() {
	return withReady(createSpokenSeries(1, [SCHOOL, TEACHER]));
}

describe('a spoken series', () => {
	it('expects the kana and the kanji of the word', () => {
		expect(hintsOf(SCHOOL)).toEqual(['がっこう', '学校']);
	});

	it('ends the word heard, timed, and prepares the next one', () => {
		const series = withHeard(ready(), '学校', 900);
		expect(series.words).toEqual([
			{
				units: ['が', 'っ', 'こ', 'う'],
				heardFirstTry: true,
				skipped: false,
				readingMs: 900,
			},
		]);
		expect(series.phase).toBe('preparing');
	});

	it('keeps a wrong answer on screen, then times nothing after a retry', () => {
		const wrong = withHeard(ready(), 'ここ', 700);
		expect(wrong).toMatchObject({
			lastHeard: 'ここ',
			misses: 1,
			words: [],
		});
		const right = withHeard(wrong, 'がっこう', 2500);
		expect(right.words[0]).toMatchObject({
			heardFirstTry: false,
			readingMs: null,
		});
		expect(right.lastHeard).toBeNull();
	});

	it('ignores what is heard while the recognizer gets ready', () => {
		const preparing = createSpokenSeries(1, [SCHOOL]);
		expect(withHeard(preparing, '学校', 900)).toBe(preparing);
	});

	it('skips a word with Space', () => {
		const series = withSkipped(ready());
		expect(series.words[0]).toMatchObject({
			skipped: true,
			readingMs: null,
		});
	});

	it('shows that a voice is heard only while listening', () => {
		expect(withSpeechStarted(ready()).phase).toBe('hearing');
		const preparing = createSpokenSeries(1, [SCHOOL]);
		expect(withSpeechStarted(preparing).phase).toBe('preparing');
	});

	it('finishes after the last word', () => {
		const first = withHeard(ready(), '学校', 900);
		const second = withHeard(withReady(first), '先生', 800);
		expect(isFinished(first)).toBe(false);
		expect(isFinished(second)).toBe(true);
	});
});
