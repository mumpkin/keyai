import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { SettingSection } from './setting-section.tsx';

export function DataSetting() {
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
		<SettingSection title={translate('settings.data.title')}>
			<Button
				variant="destructive"
				className="w-fit"
				onClick={() => setIsConfirming(true)}
			>
				{translate('settings.data.reset')}
			</Button>
			<AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{translate('settings.data.resetTitle')}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{translate('settings.data.resetDescription')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{translate('settings.data.resetCancel')}
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={reset}
						>
							{translate('settings.data.resetConfirm')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</SettingSection>
	);
}
