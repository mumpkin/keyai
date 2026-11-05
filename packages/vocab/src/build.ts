import { readFileSync, writeFileSync } from 'node:fs';
import { KANA_CATALOGUE } from '@keyai/core/kana';
import { VocabFileSchema } from '@keyai/core/vocab';
import { parse } from 'yaml';
import { readJmdict } from './io/jmdict.ts';
import {
	cachedPathOf,
	OVERRIDES_FILE,
	REPORT_FILE,
	readSources,
	VOCABULARY_FILE,
} from './io/sources.ts';
import { readWordfreq } from './io/wordfreq.ts';
import { reportOf } from './report.ts';
import { candidatesOf } from './stages/candidates.ts';
import { mergeHomographs } from './stages/merge.ts';
import { applyOverrides, OverridesSchema } from './stages/overrides.ts';
import { selectWords } from './stages/select.ts';
import { vocabularyOf } from './stages/vocabulary.ts';

/** Target vocabulary size of the V1 (C7). */
export const TARGET_SIZE = 2500;

/** Builds `data/vocab.json` and `report.md` from the cached sources. */
export function buildVocabulary(): void {
	const sources = readSources();
	const jmdict = readJmdict(cachedPathOf(sources.jmdict));
	const zipfByWord = readWordfreq(cachedPathOf(sources.wordfreq));
	const candidates = mergeHomographs(candidatesOf(jmdict.words, zipfByWord));
	const selection = selectWords(
		candidates,
		TARGET_SIZE,
		KANA_CATALOGUE.map((unit) => unit.text),
	);
	const overrides = OverridesSchema.parse(
		parse(readFileSync(OVERRIDES_FILE, 'utf8')) ?? [],
	);
	const selected = vocabularyOf(selection.words, sources);
	const vocabulary = VocabFileSchema.parse({
		...selected,
		words: applyOverrides(selected.words, overrides),
	});
	writeFileSync(
		VOCABULARY_FILE,
		`${JSON.stringify(vocabulary, null, '\t')}\n`,
	);
	writeFileSync(
		REPORT_FILE,
		reportOf({
			vocabulary,
			candidateCount: candidates.length,
			reviewedOverrides: overrides.filter((item) => item.reviewed).length,
			draftOverrides: overrides.filter((item) => !item.reviewed).length,
			coverageAdditions: selection.coverageAdditions,
			tiedHomographs: selection.words
				.filter((word) => word.tiedEntries > 1)
				.map((word) => word.kana),
		}),
	);
	console.log(
		`✓ ${vocabulary.words.length} words written to data/vocab.json, report in report.md`,
	);
}
