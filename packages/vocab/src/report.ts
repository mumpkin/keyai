import { tokenize } from '@keyai/core/input';
import { findKana, KANA_CATALOGUE } from '@keyai/core/kana';
import type { VocabFile, VocabWord } from '@keyai/core/vocab';
import { MIN_WORDS_PER_KANA } from './stages/select.ts';

const TOP_WORDS = 40;
const ORDER_PREVIEW = 80;
const PERCENT = 100;

export interface ReportInputs {
	readonly vocabulary: VocabFile;
	readonly candidateCount: number;
	readonly coverageAdditions: number;
	/** Words whose primary sense is uncertain: several entries tied. */
	readonly tiedHomographs: readonly string[];
}

function percent(part: number, total: number): string {
	return total === 0 ? '0 %' : `${Math.round((part / total) * PERCENT)} %`;
}

function wordsPerKana(words: readonly VocabWord[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const word of words) {
		const units = tokenize(word.kana).map((unit) => unit.text);
		for (const kana of new Set(units)) {
			counts.set(kana, (counts.get(kana) ?? 0) + 1);
		}
	}
	return counts;
}

function glossOf(word: VocabWord): string {
	const [primary] = word.senses;
	return primary?.gloss.fr ?? `${primary?.gloss.en ?? ''} (EN)`;
}

function summarySection(inputs: ReportInputs): string[] {
	const { words } = inputs.vocabulary;
	const french = words.filter((word) => word.senses[0]?.gloss.fr).length;
	const katakana = words.filter((word) =>
		[...word.kana].some((kana) => findKana(kana)?.script === 'katakana'),
	).length;
	return [
		'## Summary',
		'',
		'| Measure | Value |',
		'| --- | --- |',
		`| Candidates (typeable, frequent) | ${inputs.candidateCount} |`,
		`| Words | ${words.length} |`,
		`| Coverage additions | ${inputs.coverageAdditions} |`,
		`| Katakana words | ${katakana} |`,
		`| French primary gloss | ${french} (${percent(french, words.length)}) |`,
		`| Initial group | ${inputs.vocabulary.initialUnlocked} kana |`,
		'',
	];
}

function orderSection(vocabulary: VocabFile): string[] {
	const initial = vocabulary.unlockOrder.slice(0, vocabulary.initialUnlocked);
	const next = vocabulary.unlockOrder.slice(
		vocabulary.initialUnlocked,
		ORDER_PREVIEW,
	);
	return [
		'## Unlock order',
		'',
		`Initial group: ${initial.join(' ')}`,
		'',
		`Next: ${next.join(' ')}`,
		'',
	];
}

function sparseKanaSection(vocabulary: VocabFile): string[] {
	const counts = wordsPerKana(vocabulary.words);
	const sparse = vocabulary.unlockOrder.filter(
		(kana) => (counts.get(kana) ?? 0) < MIN_WORDS_PER_KANA,
	);
	return [
		`## Kana with fewer than ${MIN_WORDS_PER_KANA} words`,
		'',
		sparse.length > 0
			? sparse
					.map((kana) => `${kana} (${counts.get(kana) ?? 0})`)
					.join(' · ')
			: 'None.',
		'',
	];
}

function excludedKanaSection(vocabulary: VocabFile): string[] {
	const order = new Set(vocabulary.unlockOrder);
	const excluded = KANA_CATALOGUE.filter((unit) => !order.has(unit.text));
	return [
		'## Kana outside the progression',
		'',
		'No word can practise them, so they stay locked in the table.',
		'',
		excluded.length > 0
			? excluded.map((unit) => unit.text).join(' · ')
			: 'None.',
		'',
	];
}

function homographsSection(tiedHomographs: readonly string[]): string[] {
	return [
		'## Homographs to review',
		'',
		'Several entries share the same frequency: the primary sense must be',
		'chosen in `overrides/words.yaml`.',
		'',
		tiedHomographs.length > 0 ? tiedHomographs.join(' · ') : 'None.',
		'',
	];
}

function topWordsSection(words: readonly VocabWord[]): string[] {
	return [
		`## ${TOP_WORDS} most frequent words`,
		'',
		'| Rank | Kana | Translation | Senses |',
		'| --- | --- | --- | --- |',
		...words
			.slice(0, TOP_WORDS)
			.map(
				(word) =>
					`| ${word.rank} | ${word.kana} | ${glossOf(word)} | ${word.senses.length} |`,
			),
		'',
	];
}

/** Human-readable report to review the generated vocabulary (A6). */
export function reportOf(inputs: ReportInputs): string {
	return [
		'# Vocabulary report',
		'',
		`Sources: JMdict ${inputs.vocabulary.sources.jmdict}, wordfreq ${inputs.vocabulary.sources.wordfreq}.`,
		'',
		...summarySection(inputs),
		...orderSection(inputs.vocabulary),
		...sparseKanaSection(inputs.vocabulary),
		...excludedKanaSection(inputs.vocabulary),
		...homographsSection(inputs.tiedHomographs),
		...topWordsSection(inputs.vocabulary.words),
	].join('\n');
}
