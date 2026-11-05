import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { toHepburn } from '../input/hepburn.ts';
import { isTypeable } from '../input/spellings.ts';
import { tokenize } from '../input/tokenize.ts';
import { KANA_CATALOGUE } from '../kana/catalogue.ts';
import { createSeries } from './create.ts';
import { seriesRecordOf } from './record.ts';
import { seriesReducer } from './reducer.ts';
import { KEY_INTERVAL_MS, play } from './test-helpers.ts';

function statusesOf(words: readonly string[], script: string) {
	return play(words, script).words.map((word) => word.status);
}

describe('seriesReducer', () => {
	it('starts on the first key', () => {
		const ready = createSeries(['いぬ']);
		expect(ready.phase).toBe('ready');
		const typing = seriesReducer(ready, { type: 'key', key: 'i', at: 42 });
		expect(typing.phase).toBe('typing');
		expect(typing.startedAt).toBe(42);
	});

	it('records each unit, the first one untimed', () => {
		const state = play(['いぬ'], 'inu');
		expect(state.phase).toBe('finished');
		expect(state.attempts).toEqual([
			{
				wordIndex: 0,
				kana: 'い',
				durationMs: null,
				hadError: false,
				skipped: false,
			},
			{
				wordIndex: 0,
				kana: 'ぬ',
				durationMs: 2 * KEY_INTERVAL_MS,
				hadError: false,
				skipped: false,
			},
		]);
		expect(seriesRecordOf(state).elapsedMs).toBe(2 * KEY_INTERVAL_MS);
	});

	it('counts a wrong key against the unit and marks it red', () => {
		const state = play(['いぬ'], 'ixnu ');
		expect(state.wrongKeyCount).toBe(1);
		expect(state.words[0]?.faultyUnits).toEqual([1]);
		expect(state.attempts[1]?.hadError).toBe(true);
	});

	it('counts the wrong keys of the current word only', () => {
		expect(play(['いぬ', 'くに'], 'xix').currentWordErrors).toBe(2);
		expect(play(['いぬ', 'くに'], 'xinu ').currentWordErrors).toBe(0);
		expect(play(['いぬ', 'くに'], 'x ').currentWordErrors).toBe(0);
		expect(play(['いぬ', 'くに'], 'x <').currentWordErrors).toBe(0);
	});

	it('finishes the series with the last key of the last word', () => {
		const words = ['い', 'く'];
		expect(play(words, 'i k').phase).toBe('typing');
		expect(play(words, 'i ku').phase).toBe('finished');
		expect(statusesOf(words, 'i ku')).toEqual(['done', 'done']);
	});

	it('does not finish a word that is not the last one on its last key', () => {
		expect(play(['い', 'く'], 'i').phase).toBe('typing');
	});

	it('ignores space before the first key of a series', () => {
		const state = play(['いぬ', 'くに'], '   ');
		expect(state.phase).toBe('ready');
		expect(state.currentIndex).toBe(0);
		expect(state.attempts).toEqual([]);
	});

	it('waits for space before moving to the next word', () => {
		const state = play(['いぬ', 'くに'], 'inu');
		expect(state.currentIndex).toBe(0);
		expect(play(['いぬ', 'くに'], 'inu ').currentIndex).toBe(1);
	});

	it('times the first unit of the next word from the space', () => {
		const state = play(['い', 'く'], 'i ku');
		expect(state.attempts[1]?.durationMs).toBe(2 * KEY_INTERVAL_MS);
	});

	it('finishes on a final ん typed n', () => {
		const state = play(['ほん'], 'hon');
		expect(state.phase).toBe('finished');
		expect(state.attempts.map((attempt) => attempt.kana)).toEqual([
			'ほ',
			'ん',
		]);
	});

	it('skips an unfinished word on space, blaming the current unit', () => {
		const state = play(['いぬ', 'くに'], 'i ');
		expect(statusesOf(['いぬ', 'くに'], 'i ')).toEqual([
			'skipped',
			'current',
		]);
		expect(state.attempts.at(-1)).toEqual({
			wordIndex: 0,
			kana: 'ぬ',
			durationMs: null,
			hadError: true,
			skipped: true,
		});
	});

	it('returns to a skipped word with backspace and resumes it', () => {
		const words = ['いぬ', 'くに', 'し'];
		expect(statusesOf(words, 'i <')).toEqual([
			'current',
			'pending',
			'pending',
		]);
		expect(statusesOf(words, 'i <nu ')).toEqual([
			'done',
			'current',
			'pending',
		]);
	});

	it('ignores backspace after a validated word or within a word', () => {
		const words = ['いぬ', 'くに'];
		expect(play(words, 'inu <').currentIndex).toBe(1);
		expect(play(words, 'i k<').currentIndex).toBe(1);
	});

	it('finishes when the last word is skipped', () => {
		expect(play(['い', 'く'], 'i  ').phase).toBe('finished');
	});

	it('ignores every action once aborted', () => {
		const aborted = seriesReducer(createSeries(['いぬ']), {
			type: 'abort',
		});
		expect(aborted.phase).toBe('aborted');
		expect(
			seriesReducer(aborted, { type: 'key', key: 'i', at: 0 }).phase,
		).toBe('aborted');
	});

	it('treats an empty series as finished', () => {
		expect(createSeries([]).phase).toBe('finished');
		expect(seriesRecordOf(createSeries([])).elapsedMs).toBe(0);
	});

	it('records every unit cleanly when each word is typed correctly', () => {
		const word = fc
			.array(fc.constantFrom(...KANA_CATALOGUE), {
				minLength: 1,
				maxLength: 4,
			})
			.filter(isTypeable)
			.map((units) => units.map((unit) => unit.text).join(''));
		fc.assert(
			fc.property(
				fc.array(word, { minLength: 1, maxLength: 5 }),
				(words) => {
					const script = words
						.map((kana) => `${toHepburn(tokenize(kana))} `)
						.join('');
					const state = play(words, script);
					const unitCount = words.flatMap((kana) =>
						tokenize(kana),
					).length;
					expect(state.phase).toBe('finished');
					expect(state.wrongKeyCount).toBe(0);
					expect(state.attempts).toHaveLength(unitCount);
					expect(
						state.attempts.every((attempt) => !attempt.hadError),
					).toBe(true);
				},
			),
		);
	});
});

describe('natural writing', () => {
	const Natural = { naturalWriting: true };

	it('moves on with the last key of each word', () => {
		const state = play(['いぬ', 'ねこ'], 'inuneko', Natural);
		expect(state.phase).toBe('finished');
		expect(state.attempts).toHaveLength(4);
		expect(state.wrongKeyCount).toBe(0);
	});

	it('still needs a space by default', () => {
		const state = play(['いぬ', 'ねこ'], 'inuneko');
		expect(state.currentIndex).toBe(0);
		expect(state.wrongKeyCount).toBe(4);
	});

	it.each([
		[['ほん', 'あか'], 'honaka'],
		[['ほん', 'あか'], 'honnaka'],
		[['ほん', 'あか'], "hon'aka"],
		[['ほん', 'なか'], 'honnaka'],
		[['ほん', 'なか'], 'honnnaka'],
		[['ほん', 'やま'], 'honyama'],
		[['こう', 'おと'], 'koooto'],
		[['コーヒー', 'いま'], 'koohiiima'],
	])('reads %j typed %s', (words, script) => {
		const state = play(words, script, Natural);
		expect(state.phase).toBe('finished');
		expect(state.wrongKeyCount).toBe(0);
		expect(state.attempts.map((attempt) => attempt.kana)).toEqual(
			words.flatMap((word) => tokenize(word).map((unit) => unit.text)),
		);
	});

	it('does not read ほん + なか typed honaka', () => {
		const state = play(['ほん', 'なか'], 'honaka', Natural);
		expect(state.phase).toBe('typing');
		expect(state.wrongKeyCount).toBeGreaterThan(0);
	});

	it('blames a wrong key on the first kana of the next word', () => {
		const state = play(['ほん', 'あか'], 'honx', Natural);
		expect(state.currentIndex).toBe(1);
		expect(state.words[0]?.faultyUnits).toEqual([]);
		expect(state.words[1]?.faultyUnits).toEqual([0]);
	});

	it('ignores one space after a finished word, then skips', () => {
		const once = play(['いぬ', 'ねこ', 'いえ'], 'inu ', Natural);
		expect(once.currentIndex).toBe(1);
		expect(once.words[1]?.status).toBe('current');
		const twice = play(['いぬ', 'ねこ', 'いえ'], 'inu  ', Natural);
		expect(twice.currentIndex).toBe(2);
		expect(twice.words[1]?.status).toBe('skipped');
	});

	it('times the next word from a space typed out of habit', () => {
		const state = play(['いぬ', 'ね'], 'inu ne', Natural);
		expect(state.attempts.at(-1)?.durationMs).toBe(2 * KEY_INTERVAL_MS);
	});

	it('skips an unfinished word and comes back to it', () => {
		const skipped = play(['いぬ', 'ねこ'], 'i ', Natural);
		expect(skipped.currentIndex).toBe(1);
		const back = play(['いぬ', 'ねこ'], 'i <nuneko', Natural);
		expect(back.phase).toBe('finished');
		expect(back.words[0]?.status).toBe('done');
	});

	it('leaves a finished word alone on backspace', () => {
		const state = play(['いぬ', 'ねこ'], 'inu<', Natural);
		expect(state.currentIndex).toBe(1);
		expect(state.words[0]?.status).toBe('done');
	});

	it('records every unit cleanly from the displayed romaji', () => {
		const word = fc
			.array(fc.constantFrom(...KANA_CATALOGUE), {
				minLength: 1,
				maxLength: 4,
			})
			.filter(isTypeable)
			.map((units) => units.map((unit) => unit.text).join(''));
		fc.assert(
			fc.property(
				fc.array(word, { minLength: 1, maxLength: 5 }),
				(words) => {
					const script = words
						.map((kana) => toHepburn(tokenize(kana)))
						.join('');
					const state = play(words, script, Natural);
					expect(state.phase).toBe('finished');
					expect(state.wrongKeyCount).toBe(0);
					expect(state.attempts).toHaveLength(
						words.flatMap((kana) => tokenize(kana)).length,
					);
				},
			),
		);
	});
});
