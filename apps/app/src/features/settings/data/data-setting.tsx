import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { ConfirmDialog } from '@/features/settings/fields/confirm-dialog.tsx';
import { SettingSection } from '@/features/settings/fields/setting-section.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { type DataMessage, DataMessageLine } from './data-message.tsx';
import { ExportSave } from './export-save.tsx';
import { ExportUnreadableSave } from './export-unreadable-save.tsx';
import { ImportSave } from './import-save.tsx';

function ResetProgress() {
	const { t: translate } = useTranslation();
	const [isConfirming, setIsConfirming] = useState(false);
	const resetProgress = useProgress((state) => state.resetProgress);
	const clearSeriesResult = useUiStore((state) => state.clearSeriesResult);

	function reset() {
		resetProgress();
		clearSeriesResult();
		setIsConfirming(false);
	}

	return (
		<>
			<Button variant="destructive" onClick={() => setIsConfirming(true)}>
				{translate('settings.data.reset')}
			</Button>
			<ConfirmDialog
				isOpen={isConfirming}
				title={translate('settings.data.resetTitle')}
				description={translate('settings.data.resetDescription')}
				confirmLabel={translate('settings.data.resetConfirm')}
				cancelLabel={translate('settings.data.cancel')}
				onConfirm={reset}
				onClose={() => setIsConfirming(false)}
			/>
		</>
	);
}

export function DataSetting() {
	const { t: translate } = useTranslation();
	const [message, setMessage] = useState<DataMessage | null>(null);
	return (
		<SettingSection title={translate('settings.data.title')}>
			<div className="flex flex-wrap gap-2">
				<ExportSave onMessage={setMessage} />
				<ImportSave onMessage={setMessage} />
				<ResetProgress />
				<ExportUnreadableSave />
			</div>
			<DataMessageLine message={message} />
		</SettingSection>
	);
}
