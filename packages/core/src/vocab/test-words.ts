import type { VocabWord } from './schema.ts';

export function wordOf(kana: string, rank = 1): VocabWord {
	return {
		id: `id-${kana}`,
		kana,
		rank,
		senses: [{ gloss: { en: kana }, pos: ['noun'] }],
	};
}
