/** Hands the file to the browser, which saves it in its downloads. */
export function downloadFile(
	fileName: string,
	content: string,
): Promise<boolean> {
	const url = URL.createObjectURL(
		new Blob([content], { type: 'application/json' }),
	);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
	return Promise.resolve(true);
}
