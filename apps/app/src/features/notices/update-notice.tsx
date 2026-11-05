import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useUiStore } from '@/stores/ui-store.ts';

type UpdateStatus = 'offered' | 'applying' | 'failed';

/** Offers a new version; installing it stays the user's choice (A7). */
export function UpdateNotice() {
	const { t: translate } = useTranslation();
	const [status, setStatus] = useState<UpdateStatus>('offered');
	const applyUpdate = useUiStore((state) => state.applyUpdate);
	const dismissUpdate = useUiStore((state) => state.dismissUpdate);
	if (!applyUpdate) {
		return null;
	}

	async function apply(update: () => Promise<void>) {
		setStatus('applying');
		try {
			await update();
		} catch {
			setStatus('failed');
		}
	}

	return (
		<div
			role="status"
			className="fixed inset-x-4 bottom-4 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-popover px-4 py-2 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10"
		>
			<p className="flex-1">{translate(`update.${status}`)}</p>
			<Button
				variant="outline"
				disabled={status === 'applying'}
				onMouseDown={(event) => event.preventDefault()}
				onClick={() => void apply(applyUpdate)}
			>
				{translate('update.apply')}
			</Button>
			<Button
				variant="ghost"
				disabled={status === 'applying'}
				onMouseDown={(event) => event.preventDefault()}
				onClick={dismissUpdate}
			>
				{translate('update.later')}
			</Button>
		</div>
	);
}
