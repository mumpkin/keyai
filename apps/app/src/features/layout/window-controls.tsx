import { X as CloseIcon, Copy, Minus, Square } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';
import type { WindowControls as Controls } from '@/platform/index.ts';

function useIsMaximized(controls: Controls): boolean {
	const [isMaximized, setIsMaximized] = useState(false);

	useEffect(() => {
		const refresh = () => {
			void controls.isMaximized().then(setIsMaximized);
		};
		refresh();
		const stopListening = controls.onResized(refresh);
		return () => {
			void stopListening.then((stop) => stop());
		};
	}, [controls]);

	return isMaximized;
}

function WindowButton({ className, ...props }: ComponentProps<'button'>) {
	return (
		<button
			type="button"
			// The typing input keeps the focus, so typing goes on afterwards.
			onMouseDown={(event) => event.preventDefault()}
			className={cn(
				'flex h-8 items-center rounded-md px-3 text-muted-foreground hover:bg-muted hover:text-foreground',
				className,
			)}
			{...props}
		/>
	);
}

/** Replaces the buttons of the system title bar on the desktop app (C8). */
export function WindowControls({ controls }: { readonly controls: Controls }) {
	const { t: translate } = useTranslation();
	const isMaximized = useIsMaximized(controls);
	const MaximizeIcon = isMaximized ? Copy : Square;
	return (
		<div className="flex gap-1">
			<WindowButton
				aria-label={translate('window.minimize')}
				onClick={() => void controls.minimize()}
			>
				<Minus className="size-4" />
			</WindowButton>
			<WindowButton
				aria-label={translate(
					isMaximized ? 'window.restore' : 'window.maximize',
				)}
				onClick={() => void controls.toggleMaximize()}
			>
				<MaximizeIcon className="size-3.5" />
			</WindowButton>
			<WindowButton
				aria-label={translate('window.close')}
				onClick={() => void controls.close()}
				className="hover:bg-destructive hover:text-white"
			>
				<CloseIcon className="size-4" />
			</WindowButton>
		</div>
	);
}
