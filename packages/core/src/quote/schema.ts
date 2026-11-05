import * as zod from 'zod';

export const QuoteSchema = zod.object({
	id: zod.string().min(1),
	author: zod.string().min(1),
	authorLatin: zod.string().min(1),
	work: zod.string().min(1),
	/** Year of first publication. */
	year: zod.number().int().positive(),
	/** Card of the work on Aozora Bunko. */
	source: zod.url(),
	text: zod.string().min(1),
	/** Words split by spaces, `[kanji|reading]`, `{は}` for a particle. */
	ruby: zod.string().min(1),
	/** Card of each word, by id; `null` when it has none. */
	words: zod.array(zod.string().min(1).nullable()),
	fr: zod.string().min(1),
	en: zod.string().min(1),
});

export const QuotesSchema = zod.array(QuoteSchema).min(1);

export type Quote = zod.infer<typeof QuoteSchema>;
