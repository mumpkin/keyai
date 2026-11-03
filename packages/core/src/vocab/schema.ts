import * as zod from 'zod';

export const PART_OF_SPEECH = [
	'noun',
	'pronoun',
	'verb',
	'adjective',
	'adverb',
	'particle',
	'conjunction',
	'interjection',
	'counter',
	'prefix',
	'suffix',
	'auxiliary',
	'expression',
	'other',
] as const;

export const REGISTERS = [
	'familiar',
	'slang',
	'vulgar',
	'polite',
	'humble',
	'honorific',
] as const;

const LocalisedTextSchema = zod.object({
	fr: zod.string().min(1).optional(),
	en: zod.string().min(1).optional(),
});

export const SenseSchema = zod.object({
	/** Short translation; French falls back to English (C7). */
	gloss: zod.object({
		en: zod.string().min(1),
		fr: zod.string().min(1).optional(),
	}),
	pos: zod.array(zod.enum(PART_OF_SPEECH)).min(1),
	kanji: zod.string().min(1).optional(),
	register: zod.enum(REGISTERS).optional(),
	note: LocalisedTextSchema.optional(),
});

export const VocabWordSchema = zod.object({
	id: zod.string().min(1),
	kana: zod.string().min(1),
	/** Frequency rank, 1 being the most frequent. */
	rank: zod.number().int().positive(),
	/** The first sense is the primary one. */
	senses: zod.array(SenseSchema).min(1),
});

export const VocabFileSchema = zod.object({
	schemaVersion: zod.literal(1),
	sources: zod.object({ jmdict: zod.string(), wordfreq: zod.string() }),
	unlockOrder: zod.array(zod.string().min(1)).min(1),
	initialUnlocked: zod.number().int().positive(),
	words: zod.array(VocabWordSchema),
});

export type PartOfSpeech = (typeof PART_OF_SPEECH)[number];
export type Register = (typeof REGISTERS)[number];
export type Sense = zod.infer<typeof SenseSchema>;
export type VocabWord = zod.infer<typeof VocabWordSchema>;
export type VocabFile = zod.infer<typeof VocabFileSchema>;
