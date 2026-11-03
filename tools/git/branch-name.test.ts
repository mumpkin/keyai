import { describe, expect, it } from 'vitest';
import { isValidBranchName } from './branch-name.ts';

describe('isValidBranchName', () => {
	it.each([
		'main',
		'feat/romaji-matcher',
		'docs/functional-design',
		'chore/scaffold-monorepo',
		'dependabot/npm_and_yarn/vite-8.4.0',
	])('accepts %s', (branchName) => {
		expect(isValidBranchName(branchName)).toBe(true);
	});

	it.each([
		'romaji-matcher',
		'feature/romaji-matcher',
		'feat/Romaji-Matcher',
		'feat/romaji_matcher',
		'feat/',
		'fix/trailing-',
	])('rejects %s', (branchName) => {
		expect(isValidBranchName(branchName)).toBe(false);
	});
});
