import { createProgress, recordAttempts } from '@keyai/core/progression';
import { describe, expect, it } from 'vitest';
import { masteryBreakdownOf } from './mastery-breakdown.ts';

const UNLOCK_ORDER = ['い', 'ぬ', 'く', 'テ', 'ス'];
const CONTEXT = { unlockOrder: UNLOCK_ORDER, thresholdKanaPerMinute: 30 };

describe('masteryBreakdownOf', () => {
	it('counts locked and learning kana per script', () => {
		const progress = createProgress(UNLOCK_ORDER, 2);
		expect(masteryBreakdownOf(progress, CONTEXT)).toEqual([
			{ script: 'hiragana', mastered: 0, learning: 2, locked: 1 },
			{ script: 'katakana', mastered: 0, learning: 0, locked: 2 },
		]);
	});

	it('counts a kana typed fast and clean as mastered', () => {
		const attempts = Array.from({ length: 10 }, () => ({
			wordIndex: 0,
			kana: 'い',
			durationMs: 1000,
			hadError: false,
			skipped: false,
		}));
		const progress = recordAttempts(
			createProgress(UNLOCK_ORDER, 2),
			attempts,
		);
		expect(masteryBreakdownOf(progress, CONTEXT)[0]).toEqual({
			script: 'hiragana',
			mastered: 1,
			learning: 1,
			locked: 1,
		});
	});
});
