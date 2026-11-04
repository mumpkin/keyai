import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useUiStore } from '@/stores/ui-store.ts';

/** Offers a new version; reloading stays the user's choice (A7). */
export function UpdateNotice() {
	const { t: translate } = useTranslation();
	const applyUpdate = useUiStore((state) => state.applyUpdate);
	const dismissUpdate = useUiStore((state) => state.dismissUpdate);
	if (!applyUpdate) {
		return null;
	}
	return (
		<div
			role="status"
			className="fixed inset-x-4 bottom-4 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-popover px-4 py-2 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10"
		>
			<p className="flex-1">{translate('update.ready')}</p>
			<Button
				variant="outline"
				onMouseDown={(event) => event.preventDefault()}
				onClick={applyUpdate}
			>
				{translate('update.apply')}
			</Button>
			<Button
				variant="ghost"
				onMouseDown={(event) => event.preventDefault()}
				onClick={dismissUpdate}
			>
				{translate('update.later')}
			</Button>
		</div>
	);
}
