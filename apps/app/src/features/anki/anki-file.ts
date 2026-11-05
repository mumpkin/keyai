import { toHepburn, tokenize } from '@keyai/core/input';
import { findKana } from '@keyai/core/kana';
import type { Locale } from '@keyai/core/settings';
import type {
	PartOfSpeech,
	Register,
	Sense,
	VocabEntry,
} from '@keyai/core/vocab';
import { glossOf, noteOf } from '@/features/word-card/glosses.ts';

/**
 * Text file headers read by Anki 2.1.54 and later. The GUID matters: without
 * it, Anki replaces any note of the user that has the same front.
 */
const HEADERS = [
	'#separator:tab',
	'#html:true',
	'#notetype:Basic',
	'#deck:KeyAI',
	'#tags:keyai',
	'#guid column:1',
	'#tags column:4',
];

const LINE_BREAK = '<br>';
const SOURCE = 'JMdict (EDRDG, CC BY-SA 4.0) · KeyAI';

const HTML_ENTITIES: ReadonlyMap<string, string> = new Map([
	['&', '&amp;'],
	['<', '&lt;'],
	['>', '&gt;'],
	['"', '&quot;'],
]);

export interface AnkiCardText {
	readonly locale: Locale;
	readonly otherSenses: string;
	readonly partOfSpeechOf: (partOfSpeech: PartOfSpeech) => string;
	readonly registerOf: (register: Register) => string;
}

/** Also keeps tabs and line breaks from splitting a note. */
function escaped(text: string): string {
	return text
		.replace(/[\t\r\n]+/g, ' ')
		.replace(/[&<>"]/g, (character) => HTML_ENTITIES.get(character) ?? '');
}

function glossTextOf(sense: Sense, locale: Locale): string {
	const { text, isFallback } = glossOf(sense, locale);
	return escaped(isFallback ? `${text} (EN)` : text);
}

function frontOf({ word }: VocabEntry): string {
	const kanji = word.senses[0]?.kanji;
	const lines = kanji ? [word.kana, kanji] : [word.kana];
	return lines.map(escaped).join(LINE_BREAK);
}

function detailsOf(sense: Sense, text: AnkiCardText): string[] {
	const labels = [
		...sense.pos.map(text.partOfSpeechOf),
		...(sense.register ? [text.registerOf(sense.register)] : []),
	];
	const note = noteOf(sense, text.locale);
	return [
		escaped(labels.join(' · ')),
		...(note ? [`<i>${escaped(note)}</i>`] : []),
	];
}

function otherSenseOf(sense: Sense, locale: Locale): string {
	const kanji = sense.kanji ? ` ${escaped(sense.kanji)}` : '';
	return `· ${glossTextOf(sense, locale)}${kanji}`;
}

function backOf({ word }: VocabEntry, text: AnkiCardText): string {
	const [primary, ...others] = word.senses;
	const sense = primary as Sense;
	return [
		escaped(toHepburn(tokenize(word.kana))),
		`<b>${glossTextOf(sense, text.locale)}</b>`,
		...detailsOf(sense, text),
		...(others.length > 0 ? [escaped(text.otherSenses)] : []),
		...others.map((other) => otherSenseOf(other, text.locale)),
		`<small>${escaped(SOURCE)}</small>`,
	].join(LINE_BREAK);
}

function tagsOf({ word, units }: VocabEntry): string {
	const scripts = units.map((unit) => findKana(unit)?.script ?? '');
	const kinds = word.senses[0]?.pos ?? [];
	return [...new Set([...scripts, ...kinds])].join(' ');
}

/** One note per word, with a GUID that stays the same across exports. */
function noteLineOf(entry: VocabEntry, text: AnkiCardText): string {
	return [
		`keyai-${entry.word.id}`,
		frontOf(entry),
		backOf(entry, text),
		tagsOf(entry),
	].join('\t');
}

export function ankiFileOf(
	entries: readonly VocabEntry[],
	text: AnkiCardText,
): string {
	const notes = entries.map((entry) => noteLineOf(entry, text));
	return `${[...HEADERS, ...notes].join('\n')}\n`;
}

export function ankiFileNameOf(date: Date): string {
	const [day] = date.toISOString().split('T');
	return `keyai-anki-${day}.txt`;
}
