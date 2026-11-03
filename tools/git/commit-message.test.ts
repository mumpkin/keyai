import { describe, expect, it } from 'vitest';
import { findCommitMessageErrors } from './commit-message.ts';

const STRICT = { allowAutosquash: false };
const LOCAL = { allowAutosquash: true };

describe('findCommitMessageErrors', () => {
	it.each([
		'Add `tokenize` to split words into kana units',
		'Handle `ん` before vowels in the matcher',
		'Configure `biome.json` with tab indentation\n\nWith a body.',
	])('accepts "%s"', (message) => {
		expect(findCommitMessageErrors(message, STRICT)).toEqual([]);
	});

	it.each([
		['feat: add the matcher', 'type prefix'],
		['fix(core): handle ん', 'type prefix'],
		['add the matcher', 'capital letter'],
		['Add the matcher.', 'punctuation'],
		['Added the matcher', 'imperative mood'],
		['Merge branch main', 'imperative mood'],
		[`Add ${'a very long subject '.repeat(4)}`, 'characters'],
		['', 'empty'],
		['fixup! Add the matcher', 'Squash'],
	])('rejects "%s" (%s)', (message, expectedError) => {
		const errors = findCommitMessageErrors(message, STRICT);
		expect(errors.join(' ')).toContain(expectedError);
	});

	it('lets autosquash commits through locally', () => {
		const errors = findCommitMessageErrors('fixup! Add the matcher', LOCAL);
		expect(errors).toEqual([]);
	});
});
