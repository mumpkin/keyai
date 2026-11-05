import { describe, expect, it } from 'vitest';
import { createSeries } from '../session/create.ts';
import { seriesReducer } from '../session/reducer.ts';
import { quoteSeriesOf, quoteTokensOf, withTypedMarks } from './parse.ts';
import { quoteInKana } from './script.ts';

describe('quoteInKana', () => {
	it('shows the reading of the kanji', () => {
		const [word] = quoteInKana(quoteTokensOf('[犬|いぬ]'));
		expect(word).toMatchObject({ pieces: [{ text: 'いぬ' }] });
	});
});

describe('withTypedMarks', () => {
	function played(keys: string) {
		const tokens = withTypedMarks(quoteTokensOf('[犬|いぬ] 、 ねこ 。'));
		const { words, typing } = quoteSeriesOf(tokens);
		return [...keys].reduce(
			(state, key, index) =>
				seriesReducer(state, { type: 'key', key, at: index }),
			createSeries(words, { naturalWriting: true, typing }),
		);
	}

	it('waits for the key of each mark', () => {
		const state = played('inu,neko.');
		expect(state.phase).toBe('finished');
		expect(state.wrongKeyCount).toBe(0);
	});

	it('refuses a word typed over a mark', () => {
		expect(played('inun').wrongKeyCount).toBe(1);
	});
});
