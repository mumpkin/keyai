import { quoteTokensOf, quoteWordsOf } from '@keyai/core/quote';
import { describe, expect, it } from 'vitest';
import { pieceStateOf, pieceViewsOf, quoteGroupsOf } from './quote-view.ts';

describe('quoteGroupsOf', () => {
	it('keeps closing marks with the previous word', () => {
		expect(quoteGroupsOf(quoteTokensOf('[犬|いぬ] 、 ねこ 。'))).toEqual([
			{ wordIndex: 0, before: '', after: '、' },
			{ wordIndex: 1, before: '', after: '。' },
		]);
	});

	it('keeps opening marks with the next word', () => {
		expect(quoteGroupsOf(quoteTokensOf('「 いぬ 」 と'))).toEqual([
			{ wordIndex: 0, before: '「', after: '」' },
			{ wordIndex: 1, before: '', after: '' },
		]);
	});
});

describe('pieceViewsOf', () => {
	const unit = (kana: string, state = 'pending' as const) => ({
		id: kana,
		kana,
		state,
	});

	it('shares the units between kanji and kana', () => {
		const [word] = quoteWordsOf(quoteTokensOf('[扱|あつか]う'));
		const units = ['あ', 'つ', 'か', 'う'].map((kana) => unit(kana));
		const views = word ? pieceViewsOf(word, units) : [];
		expect(views.map((view) => view.units.length)).toEqual([3, 1]);
	});

	it('keeps a combination whole', () => {
		const [word] = quoteWordsOf(quoteTokensOf('[今日|きょう]'));
		const views = word
			? pieceViewsOf(word, [unit('きょ'), unit('う')])
			: [];
		expect(views[0]?.units).toHaveLength(2);
	});
});

describe('pieceStateOf', () => {
	const of = (...states: string[]) =>
		pieceStateOf(
			states.map((state, index) => ({
				id: String(index),
				kana: 'あ',
				state: state as 'typed',
			})),
		);

	it('fills a kanji only once all its units are typed', () => {
		expect(of('typed', 'typed')).toBe('typed');
		expect(of('typed', 'next')).toBe('partial');
		expect(of('next', 'pending')).toBe('next');
		expect(of('pending', 'pending')).toBe('pending');
	});

	it('keeps the fault of any unit', () => {
		expect(of('typed', 'faulty')).toBe('faulty');
	});
});
