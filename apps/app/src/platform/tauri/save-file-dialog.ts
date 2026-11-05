import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { type ExportFormat, JSON_EXPORT } from '@/platform/types.ts';

/** A webview has no downloads folder: the user picks where the file goes. */
export async function saveFileWithDialog(
	fileName: string,
	content: string,
	format: ExportFormat = JSON_EXPORT,
): Promise<boolean> {
	const path = await save({
		defaultPath: fileName,
		filters: [{ name: 'keyai', extensions: [format.extension] }],
	});
	if (path === null) {
		return false;
	}
	await writeTextFile(path, content);
	return true;
}
