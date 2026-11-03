export type WordStatus = 'done' | 'skipped' | 'current' | 'pending';

export interface SampleWord {
	readonly kana: string;
	readonly romaji: string;
	readonly gloss: string;
	readonly status: WordStatus;
	readonly kanji?: string;
	readonly otherSenses?: readonly string[];
	readonly faultyUnits?: readonly number[];
	readonly completedUnits?: number;
	readonly hasPartialInput?: boolean;
}

export const SAMPLE_WORDS: readonly SampleWord[] = [
	{
		kana: 'いぬ',
		romaji: 'inu',
		gloss: 'chien',
		kanji: '犬',
		status: 'done',
	},
	{
		kana: 'くに',
		romaji: 'kuni',
		gloss: 'pays',
		status: 'done',
		faultyUnits: [1],
	},
	{ kana: 'すし', romaji: 'sushi', gloss: 'sushi', status: 'skipped' },
	{
		kana: 'いる',
		romaji: 'iru',
		gloss: 'être, exister',
		kanji: '居る',
		otherSenses: ['avoir besoin de (要る)', 'entrer (入る)'],
		status: 'done',
	},
	{
		kana: 'ねこ',
		romaji: 'neko',
		gloss: 'chat',
		status: 'current',
		completedUnits: 1,
		faultyUnits: [0],
		hasPartialInput: true,
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
