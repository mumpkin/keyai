import { describe, expect, it } from 'vitest';
import { practicableKanaOf } from '../selection/practicable.ts';
import { indexVocabulary } from '../vocab/entries.ts';
import { wordOf } from '../vocab/test-words.ts';
import { cleanAttempts } from './test-helpers.ts';
import { applySeries, createProgress } from './unlock.ts';

const ORDER = ['い', 'ぬ', 'テ', 'ス', 'ト'];
const ENTRIES = indexVocabulary(['いぬ', 'テスト'].map((kana) => wordOf(kana)));

describe('unpracticable kana', () => {
	it('are the unlocked kana without any typeable word', () => {
		const unlocked = new Set(['い', 'ぬ', 'テ']);
		expect(practicableKanaOf(ENTRIES, unlocked)).toEqual(
			new Set(['い', 'ぬ']),
		);
	});

	it('do not hold back the next unlock', () => {
		const progress = createProgress(ORDER, 3);
		const attempts = [...cleanAttempts('い', 5), ...cleanAttempts('ぬ', 5)];
		const practicableKana = practicableKanaOf(
			ENTRIES,
			new Set(progress.unlocked),
		);
		const rules = { unlockOrder: ORDER, thresholdKanaPerMinute: 30 };
		expect(
			applySeries(progress, attempts, rules).unlockedKana,
		).toBeUndefined();
		expect(
			applySeries(progress, attempts, { ...rules, practicableKana })
				.unlockedKana,
		).toBe('ス');
	});
});
