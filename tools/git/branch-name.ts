export const BRANCH_TYPES = [
	'feat',
	'fix',
	'docs',
	'refactor',
	'perf',
	'test',
	'ci',
	'chore',
] as const;

const ALLOWED_BRANCHES = new Set(['main']);
const AUTOMATED_BRANCH = /^dependabot\//;
const TYPED_BRANCH = new RegExp(
	`^(${BRANCH_TYPES.join('|')})/[a-z0-9]+(-[a-z0-9]+)*$`,
);

export function isValidBranchName(branchName: string): boolean {
	return (
		ALLOWED_BRANCHES.has(branchName) ||
		AUTOMATED_BRANCH.test(branchName) ||
		TYPED_BRANCH.test(branchName)
	);
}
