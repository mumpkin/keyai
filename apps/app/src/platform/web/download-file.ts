import { type ExportFormat, JSON_EXPORT } from '@/platform/types.ts';

/** Hands the file to the browser, which saves it in its downloads. */
export function downloadFile(
	fileName: string,
	content: string,
	format: ExportFormat = JSON_EXPORT,
): Promise<boolean> {
	const url = URL.createObjectURL(
		new Blob([content], { type: format.mimeType }),
	);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
	return Promise.resolve(true);
}
