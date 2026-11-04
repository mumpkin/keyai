import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { ExportUnreadableSave } from '@/features/settings/export-unreadable-save.tsx';
import { useProgress } from '@/stores/app-context.tsx';

/** Says at launch that the stored save was not used (C6). */
export function SaveIssueNotice() {
	const { t: translate } = useTranslation();
	const [isDismissed, setIsDismissed] = useState(false);
	const loadIssue = useProgress((state) => state.loadIssue);
	if (loadIssue === null || isDismissed) {
		return null;
	}
	return (
		<div
			role="alert"
			className="fixed inset-x-4 bottom-4 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-popover px-4 py-2 text-sm shadow-lg ring-1 ring-destructive/40"
		>
			<p className="flex-1 text-destructive">
				{translate(
					loadIssue === 'unsupportedVersion'
						? 'saveIssue.newerVersion'
						: 'saveIssue.unreadable',
				)}
			</p>
			<ExportUnreadableSave />
			<Button
				variant="ghost"
				onMouseDown={(event) => event.preventDefault()}
				onClick={() => setIsDismissed(true)}
			>
				{translate('saveIssue.dismiss')}
			</Button>
		</div>
	);
}
