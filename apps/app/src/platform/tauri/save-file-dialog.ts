import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

/** A webview has no downloads folder: the user picks where the file goes. */
export async function saveFileWithDialog(
	fileName: string,
	content: string,
): Promise<boolean> {
	const path = await save({
		defaultPath: fileName,
		filters: [{ name: 'keyai', extensions: ['json'] }],
	});
	if (path === null) {
		return false;
	}
	await writeTextFile(path, content);
	return true;
}
