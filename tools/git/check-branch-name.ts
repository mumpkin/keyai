import { execFileSync } from 'node:child_process';
import { BRANCH_TYPES, isValidBranchName } from './branch-name.ts';

const branchName =
	process.argv[2] ??
	execFileSync('git', ['branch', '--show-current'], {
		encoding: 'utf8',
	}).trim();

if (!isValidBranchName(branchName)) {
	console.error(`Invalid branch name: "${branchName}"`);
	console.error(`  Expected <type>/<kebab-case-topic> with a type among:`);
	console.error(`  ${BRANCH_TYPES.join(', ')}`);
	console.error('See CONTRIBUTING.md#branches');
	process.exit(1);
}
