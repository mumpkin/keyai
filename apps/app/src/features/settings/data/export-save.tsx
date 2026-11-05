import { saveFileNameOf, serializeSave } from '@keyai/core/save';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useExportFile, useProgressStore } from '@/stores/app-context.tsx';
import type { DataMessage } from './data-message.tsx';

export function ExportSave({
	onMessage,
}: {
	readonly onMessage: (message: DataMessage | null) => void;
}) {
	const { t: translate } = useTranslation();
	const store = useProgressStore();
	const exportFile = useExportFile();

	async function exportSave() {
		const content = serializeSave(store.getState().save);
		try {
			const isExported = await exportFile(
				saveFileNameOf(new Date()),
				content,
			);
			onMessage(
				isExported
					? { text: translate('settings.data.exportDone') }
					: null,
			);
		} catch {
			onMessage({
				text: translate('settings.data.exportFailed'),
				isError: true,
			});
		}
	}

	return (
		<Button variant="outline" onClick={() => void exportSave()}>
			{translate('settings.data.export')}
		</Button>
	);
}
