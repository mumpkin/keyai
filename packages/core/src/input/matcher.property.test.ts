import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { KANA_CATALOGUE } from '../kana/catalogue.ts';
import { toHepburn } from './hepburn.ts';
import { createMatcher, feedKey } from './matcher.ts';
import { isTypeable, spellingsOf } from './spellings.ts';
import { rejectionsOf, typeWord } from './test-helpers.ts';
import { tokenize } from './tokenize.ts';

const MAX_WORD_LENGTH = 6;
const KEYS = [..."abcdefghijklmnopqrstuvwxyz-'"];

const typeableWord = fc
	.array(fc.constantFrom(...KANA_CATALOGUE), {
		minLength: 1,
		maxLength: MAX_WORD_LENGTH,
	})
	.filter(isTypeable)
	.map((units) => units.map((unit) => unit.text).join(''));

/** A typeable word and one accepted spelling chosen for each of its units. */
const wordWithSpelling = typeableWord.chain((word) => {
	const spellings = spellingsOf(tokenize(word));
	const choices = spellings.map((options) => fc.constantFrom(...options));
	return fc.tuple(fc.constant(word), ...choices).map(([text, ...keys]) => ({
		word: text,
		keys: keys.join(''),
	}));
});

describe('matcher properties', () => {
	it('accepts any combination of accepted spellings', () => {
		fc.assert(
			fc.property(wordWithSpelling, ({ word, keys }) => {
				const outcome = typeWord(word, keys);
				expect(rejectionsOf(outcome)).toEqual([]);
				expect(outcome.isFinished).toBe(true);
			}),
		);
	});

	it('accepts the Hepburn reading of every typeable word', () => {
		fc.assert(
			fc.property(typeableWord, (word) => {
				const outcome = typeWord(word, toHepburn(tokenize(word)));
				expect(rejectionsOf(outcome)).toEqual([]);
				expect(outcome.isFinished).toBe(true);
			}),
		);
	});

	it('ignores the case of the keys', () => {
		fc.assert(
			fc.property(wordWithSpelling, ({ word, keys }) => {
				expect(typeWord(word, keys.toUpperCase()).isFinished).toBe(
					true,
				);
			}),
		);
	});

	it('leaves the state untouched when a key is only rejected', () => {
		fc.assert(
			fc.property(
				wordWithSpelling,
				fc.nat(),
				fc.constantFrom(...KEYS),
				({ word, keys }, cut, key) => {
					let state = createMatcher(word);
					for (const typedKey of keys.slice(
						0,
						cut % (keys.length + 1),
					)) {
						state = feedKey(state, typedKey).state;
					}
					const result = feedKey(state, key);
					const isOnlyRejected =
						result.events.length === 1 &&
						result.events[0]?.kind === 'keyRejected';
					if (isOnlyRejected) {
						expect(result.state).toBe(state);
					}
				},
			),
		);
	});
});
