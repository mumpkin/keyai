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
			className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-destructive/10 px-4 py-2 text-sm"
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
