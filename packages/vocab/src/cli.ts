import { buildVocabulary } from './build.ts';
import { checkVocabulary } from './check.ts';
import { fetchSources } from './io/fetch.ts';

const COMMANDS: Readonly<Record<string, () => Promise<boolean> | boolean>> = {
	fetch: async () => {
		await fetchSources();
		return true;
	},
	build: () => {
		buildVocabulary();
		return true;
	},
	check: checkVocabulary,
};

const [commandName = ''] = process.argv.slice(2);
const command = COMMANDS[commandName];

if (!command) {
	console.error(`Usage: cli.ts <${Object.keys(COMMANDS).join('|')}>`);
	process.exit(2);
}
process.exit((await command()) ? 0 : 1);
