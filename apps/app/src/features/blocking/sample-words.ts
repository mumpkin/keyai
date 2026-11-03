export type WordStatus = 'done' | 'skipped' | 'current' | 'pending';

export interface SampleWord {
	readonly kana: string;
	readonly romaji: string;
	readonly gloss: string;
	readonly status: WordStatus;
	readonly typed?: string;
}

export const SAMPLE_WORDS: readonly SampleWord[] = [
	{ kana: 'いぬ', romaji: 'inu', gloss: 'chien', status: 'done' },
	{ kana: 'くに', romaji: 'kuni', gloss: 'pays', status: 'done' },
	{ kana: 'すし', romaji: 'sushi', gloss: 'sushi', status: 'skipped' },
	{ kana: 'いる', romaji: 'iru', gloss: 'être, exister', status: 'done' },
	{
		kana: 'ねこ',
		romaji: 'neko',
		gloss: 'chat',
		status: 'current',
		typed: 'ne',
	},
	{ kana: 'きく', romaji: 'kiku', gloss: 'écouter', status: 'pending' },
	{ kana: 'のこす', romaji: 'nokosu', gloss: 'laisser', status: 'pending' },
	{ kana: 'いし', romaji: 'ishi', gloss: 'pierre', status: 'pending' },
	{ kana: 'くし', romaji: 'kushi', gloss: 'peigne', status: 'pending' },
	{ kana: 'ねる', romaji: 'neru', gloss: 'dormir', status: 'pending' },
	{ kana: 'さく', romaji: 'saku', gloss: 'fleurir', status: 'pending' },
	{
		kana: 'の',
		romaji: 'no',
		gloss: 'particule (possession)',
		status: 'pending',
	},
];
