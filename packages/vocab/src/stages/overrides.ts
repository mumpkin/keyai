import type { Sense, VocabWord } from '@keyai/core/vocab';
import * as zod from 'zod';

/**
 * Up to this rank, the French of JMdict is not trusted: frequent words have
 * many senses and its French is not aligned with them (C7).
 */
export const FRENCH_REVIEW_RANK = 300;

const OverrideSchema = zod.object({
	kana: zod.string().min(1),
	/** Translation of the primary sense. */
	fr: zod.string().min(1),
	/** Start of the English gloss of the sense to put first, if not the first. */
	primary: zod.string().min(1).optional(),
	/** Drafts stay out of the vocabulary until they are reviewed. */
	reviewed: zod.boolean(),
});

export const OverridesSchema = zod.array(OverrideSchema);
export type Override = zod.infer<typeof OverrideSchema>;

function withPrimarySense(word: VocabWord, start: string): readonly Sense[] {
	const primary = word.senses.find((sense) =>
		sense.gloss.en.startsWith(start),
	);
	if (!primary) {
		throw new Error(`No sense "${start}" in ${word.kana}`);
	}
	return [primary, ...word.senses.filter((sense) => sense !== primary)];
}

function withoutFrench({ gloss: { en }, ...sense }: Sense): Sense {
	return { ...sense, gloss: { en } };
}

function overriddenWord(word: VocabWord, override: Override): VocabWord {
	const senses = override.primary
		? withPrimarySense(word, override.primary)
		: word.senses;
	const [first, ...others] = senses as [Sense, ...Sense[]];
	return {
		...word,
		senses: [
			{ ...first, gloss: { ...first.gloss, fr: override.fr } },
			...others.map(withoutFrench),
		],
	};
}

function reviewedWord(word: VocabWord): VocabWord {
	return word.rank <= FRENCH_REVIEW_RANK
		? { ...word, senses: word.senses.map(withoutFrench) }
		: word;
}

/** Applies the reviewed overrides; an override must match a word. */
export function applyOverrides(
	words: readonly VocabWord[],
	overrides: readonly Override[],
): VocabWord[] {
	const known = new Set(words.map((word) => word.kana));
	const unknown = overrides.find((override) => !known.has(override.kana));
	if (unknown) {
		throw new Error(`No word for the override of ${unknown.kana}`);
	}
	const byKana = new Map(
		overrides
			.filter((override) => override.reviewed)
			.map((override) => [override.kana, override]),
	);
	return words.map((word) => {
		const override = byKana.get(word.kana);
		return override ? overriddenWord(word, override) : reviewedWord(word);
	});
}
