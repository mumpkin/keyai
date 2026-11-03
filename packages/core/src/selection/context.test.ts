import { describe, expect, it } from 'vitest';
import type { Progress } from '../progression/schema.ts';
import { selectionContextOf } from './context.ts';

const FAST = { ms: 1000, error: false };

describe('selectionContextOf', () => {
	it('features the last unlocked kana and lists weak kana, weakest first', () => {
		const progress: Progress = {
			unlocked: ['い', 'の', 'に', 'く'],
			kana: Object.fromEntries([
				['い', { seen: 5, errors: 0, recent: Array(5).fill(FAST) }],
				[
					'の',
					{
						seen: 2,
						errors: 0,
						recent: [{ ms: 4000, error: false }],
					},
				],
				[
					'に',
					{
						seen: 2,
						errors: 0,
						recent: [{ ms: 2500, error: false }],
					},
				],
			]),
		};
		const context = selectionContextOf([], progress, 30);
		expect(context.featuredKana).toBe('く');
		expect(context.weakKana).toEqual(['く', 'の', 'に']);
		expect(context.unlocked.has('い')).toBe(true);
	});
});
