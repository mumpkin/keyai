import { useEffect, useState } from 'react';
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

/**
 * Asked once, at the first launch; the settings can start the tour later. It
 * leaves at once rather than through the closing animation of the dialog:
 * should that one never end, its backdrop would blur the whole tour.
 */
export function TourOffer() {
	const { t: translate } = useTranslation();
	const startTour = useUiStore((state) => state.startTour);
	const requestTypingFocus = useUiStore((state) => state.requestTypingFocus);
	const isFirstLaunch = useProgress((state) => state.isFirstLaunch);
	const [answer, setAnswer] = useState<'none' | 'accepted' | 'declined'>(
		isFirstLaunch && isDesktopSize() ? 'none' : 'declined',
	);

	useEffect(() => {
		if (answer === 'accepted') {
			startTour('visit');
		} else if (answer === 'declined' && isFirstLaunch) {
			requestTypingFocus();
		}
	}, [answer, isFirstLaunch, startTour, requestTypingFocus]);

	if (answer !== 'none') {
		return null;
	}
	return (
		<AlertDialog open>
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
					<AlertDialogCancel onClick={() => setAnswer('declined')}>
						{translate('tour.decline')}
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => setAnswer('accepted')}>
						{translate('tour.accept')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
