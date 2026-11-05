import { entryOf, type VocabWord } from '@keyai/core/vocab';
import { describe, expect, it } from 'vitest';
import { ankiFileNameOf, ankiFileOf } from './anki-file.ts';

const WORD: VocabWord = {
	id: '1237410',
	kana: 'はし',
	rank: 10,
	senses: [
		{
			gloss: { en: 'bridge', fr: 'pont' },
			pos: ['noun'],
			kanji: '橋',
			note: { fr: 'Un "pont" <bas>' },
		},
		{ gloss: { en: 'chopsticks' }, pos: ['noun'], kanji: '箸' },
	],
};

const PARTICLE: VocabWord = {
	id: '1469800',
	kana: 'の',
	rank: 1,
	senses: [{ gloss: { en: 'possessive' }, pos: ['particle'] }],
};

const TEXT = {
	locale: 'fr',
	otherSenses: 'Autres sens',
	partOfSpeechOf: (partOfSpeech: string) => `pos:${partOfSpeech}`,
	registerOf: (register: string) => `register:${register}`,
} as const;

function notesOf(...words: VocabWord[]): string[][] {
	const entries = words.flatMap((word) => entryOf(word) ?? []);
	return ankiFileOf(entries, TEXT)
		.trim()
		.split('\n')
		.filter((line) => !line.startsWith('#'))
		.map((line) => line.split('\t'));
}

describe('ankiFileOf', () => {
	it('starts with the headers, the GUID protecting the notes of the user', () => {
		const file = ankiFileOf([], TEXT);
		expect(file).toContain('#separator:tab\n');
		expect(file).toContain('#guid column:1\n');
	});

	it('gives each word a stable GUID', () => {
		expect(notesOf(WORD)[0]?.[0]).toBe('keyai-1237410');
	});

	it('shows the kana and the usual kanji on the front', () => {
		expect(notesOf(WORD)[0]?.[1]).toBe('はし<br>橋');
	});

	it('shows only the kana when there is no kanji', () => {
		expect(notesOf(PARTICLE)[0]?.[1]).toBe('の');
	});

	it('uses the language of the interface and marks English', () => {
		const back = notesOf(WORD)[0]?.[2];
		expect(back).toContain('<b>pont</b>');
		expect(back).toContain('· chopsticks (EN) 箸');
		expect(back).toContain('hashi');
		expect(back).toContain('JMdict');
	});

	it('escapes what Anki would read as HTML or as a quoted field', () => {
		expect(notesOf(WORD)[0]?.[2]).toContain(
			'Un &quot;pont&quot; &lt;bas&gt;',
		);
	});

	it('tags the script and the nature of the word', () => {
		expect(notesOf(WORD)[0]?.[3]).toBe('hiragana noun');
	});

	it('keeps one line per word', () => {
		expect(notesOf(WORD, PARTICLE)).toHaveLength(2);
	});
});

describe('ankiFileNameOf', () => {
	it('dates the file', () => {
		expect(ankiFileNameOf(new Date('2026-11-05T12:00:00Z'))).toBe(
			'keyai-anki-2026-11-05.txt',
		);
	});
});
