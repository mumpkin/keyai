import { describe, expect, it } from 'vitest';
import { ProgressSchema } from './schema.ts';

const KANA = 'い';

describe('ProgressSchema', () => {
	it('accepts a valid progress', () => {
		const progress = {
			unlocked: ['い', 'の'],
			kana: {
				[KANA]: {
					seen: 2,
					errors: 1,
					recent: [{ ms: 800, error: false }],
				},
			},
		};
		expect(ProgressSchema.parse(progress)).toEqual(progress);
	});

	it.each([
		{ unlocked: [''], kana: {} },
		{ unlocked: [], kana: { [KANA]: { seen: -1, errors: 0, recent: [] } } },
		{
			unlocked: [],
			kana: { [KANA]: { seen: 1, errors: 0, recent: [{ ms: 'x' }] } },
		},
		{ unlocked: [] },
	])('rejects an invalid progress (%#)', (progress) => {
		expect(ProgressSchema.safeParse(progress).success).toBe(false);
	});
});
