import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import fr from './locales/fr.json';

function keysOf(messages: object, prefix = ''): string[] {
	return Object.entries(messages).flatMap(([key, value]) =>
		typeof value === 'object'
			? keysOf(value, `${prefix}${key}.`)
			: [`${prefix}${key}`],
	);
}

describe('translations', () => {
	it('defines the same keys in every language', () => {
		expect(keysOf(en).sort()).toEqual(keysOf(fr).sort());
	});
});
