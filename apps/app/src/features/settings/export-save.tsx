import { saveFileNameOf, serializeSave } from '@keyai/core/save';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useExportFile, useProgressStore } from '@/stores/app-context.tsx';

type ExportStatus = 'idle' | 'done' | 'failed';

export function ExportSave() {
	const { t: translate } = useTranslation();
	const store = useProgressStore();
	const exportFile = useExportFile();
	const [status, setStatus] = useState<ExportStatus>('idle');

	async function exportSave() {
		const content = serializeSave(store.getState().save);
		try {
			const isExported = await exportFile(
				saveFileNameOf(new Date()),
				content,
			);
			setStatus(isExported ? 'done' : 'idle');
		} catch {
			setStatus('failed');
		}
	}

	return (
		<>
			<Button variant="outline" onClick={() => void exportSave()}>
				{translate('settings.data.export')}
			</Button>
			{status !== 'idle' && (
				<p
					role="status"
					className="w-full text-sm text-muted-foreground"
				>
					{translate(
						status === 'done'
							? 'settings.data.exportDone'
							: 'settings.data.exportFailed',
					)}
				</p>
			)}
		</>
	);
}
