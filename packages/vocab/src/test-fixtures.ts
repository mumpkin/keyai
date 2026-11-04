import type { JmdictSense, JmdictWord } from './io/jmdict.ts';
import type { Candidate } from './stages/candidates.ts';

export function sense(
	english: string,
	overrides: Partial<JmdictSense> = {},
): JmdictSense {
	return {
		partOfSpeech: ['n'],
		misc: [],
		info: [],
		gloss: [{ lang: 'eng', text: english }],
		...overrides,
	};
}

export function frenchSense(french: string): JmdictSense {
	return sense('', { gloss: [{ lang: 'fre', text: french }] });
}

export function jmdictWord(
	kana: string,
	senses: readonly JmdictSense[],
	kanji?: string,
): JmdictWord {
	return {
		id: `id-${kana}-${kanji ?? ''}`,
		kana: [{ text: kana, common: true, tags: [] }],
		kanji: kanji ? [{ text: kanji, common: true, tags: [] }] : [],
		sense: senses,
	};
}

export function candidate(
	kana: string,
	zipf: number,
	english = kana,
): Candidate {
	return {
		id: `id-${kana}-${zipf}`,
		kana,
		units: [...kana],
		zipf,
		senses: [{ gloss: { en: english }, pos: ['noun'] }],
		tiedEntries: 1,
	};
}
