import { saveFileNameOf } from '@keyai/core/save';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useExportFile, useProgress } from '@/stores/app-context.tsx';

/** Only there when a save could not be read: it is the only way to get it. */
export function ExportUnreadableSave() {
	const { t: translate } = useTranslation();
	const exportFile = useExportFile();
	const copy = useProgress((state) => state.unreadableCopy);
	if (copy === null) {
		return null;
	}
	return (
		<Button
			variant="outline"
			onMouseDown={(event) => event.preventDefault()}
			onClick={() =>
				void exportFile(
					`unreadable-${saveFileNameOf(new Date())}`,
					copy,
				)
			}
		>
			{translate('saveIssue.exportCopy')}
		</Button>
	);
}
