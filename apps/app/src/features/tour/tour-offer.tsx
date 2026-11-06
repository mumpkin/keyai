import { useRef, useState } from 'react';
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
import { isDesktopSize } from '@/lib/utils.ts';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';

/** Asked once, at the first launch; the settings can start the tour later. */
export function TourOffer() {
	const { t: translate } = useTranslation();
	const startTour = useUiStore((state) => state.startTour);
	const requestTypingFocus = useUiStore((state) => state.requestTypingFocus);
	const isFirstLaunch = useProgress((state) => state.isFirstLaunch);
	const isAccepted = useRef(false);
	const [isOpen, setIsOpen] = useState(isFirstLaunch && isDesktopSize());
	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={setIsOpen}
			onOpenChangeComplete={(open) => {
				if (open) {
					return;
				}
				// Once closed: its backdrop would blur the whole tour.
				if (isAccepted.current) {
					startTour('visit');
				} else {
					requestTypingFocus();
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{translate('tour.offerTitle')}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{translate('tour.offerDescription')}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>
						{translate('tour.decline')}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							isAccepted.current = true;
							setIsOpen(false);
						}}
					>
						{translate('tour.accept')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
