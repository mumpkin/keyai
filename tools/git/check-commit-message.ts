import { readFileSync } from 'node:fs';
import { findCommitMessageErrors } from './commit-message.ts';

const [messageFile, ...flags] = process.argv.slice(2);

if (!messageFile) {
	console.error('Usage: check-commit-message.ts <file> [--allow-autosquash]');
	process.exit(2);
}

const message = readFileSync(messageFile, 'utf8');
const errors = findCommitMessageErrors(message, {
	allowAutosquash: flags.includes('--allow-autosquash'),
});

if (errors.length > 0) {
	console.error(`Invalid commit message: "${message.split('\n')[0]}"`);
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	console.error('See CONTRIBUTING.md#commit-messages');
	process.exit(1);
}
