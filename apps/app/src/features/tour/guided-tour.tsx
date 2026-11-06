import { withTrainingMode } from '@keyai/core/settings';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EVENTS, Joyride, type Step } from 'react-joyride';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import {
	CENTER,
	type TourPlace,
	type TourStep,
	VISIT_STEPS,
	WORD_CARD_STEPS,
} from './tour-steps.ts';
import { TourTooltip } from './tour-tooltip.tsx';

const TARGET_WAIT_MS = 5000;
const BEFORE_TIMEOUT_MS = 6000;
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

/** The statistics load on demand: their zones come after the screen changes. */
function targetReady(target: string): Promise<void> {
	const deadline = performance.now() + TARGET_WAIT_MS;
	return new Promise((resolve) => {
		const check = () => {
			if (
				document.querySelector(target) ||
				performance.now() > deadline
			) {
				resolve();
			} else {
				requestAnimationFrame(check);
			}
		};
		check();
	});
}

function useMoveTo() {
	const navigate = useUiStore((state) => state.navigate);
	const updateSettings = useProgress((state) => state.updateSettings);
	return ({ screen, mode }: TourPlace) => {
		navigate(screen);
		if (mode) {
			updateSettings((settings) => withTrainingMode(settings, mode));
		}
	};
}

function useJoyrideSteps(steps: readonly TourStep[]): Step[] {
	const { t: translate } = useTranslation();
	const moveTo = useMoveTo();
	return steps.map(({ id, target, place }) => ({
		target,
		content: translate(`tour.steps.${id}` as 'tour.steps.welcome'),
		placement: target === CENTER ? 'center' : 'auto',
		before: () => {
			moveTo(place);
			return targetReady(target);
		},
	}));
}

/** The running tour; the mode and the screen come back at its end. */
function RunningTour({ steps }: { readonly steps: readonly TourStep[] }) {
	const endTour = useUiStore((state) => state.endTour);
	const moveTo = useMoveTo();
	const mode = useProgress((state) => state.save.settings.trainingMode);
	const initialMode = useRef(mode);
	const joyrideSteps = useJoyrideSteps(steps);
	const { t: translate } = useTranslation();
	return (
		<Joyride
			run
			continuous
			steps={joyrideSteps}
			tooltipComponent={TourTooltip}
			locale={{
				back: translate('tour.back'),
				close: translate('tour.done'),
				last: translate('tour.done'),
				next: translate('tour.next'),
				nextWithProgress: translate('tour.next'),
				skip: translate('tour.skip'),
			}}
			options={{
				skipBeacon: true,
				blockTargetInteraction: true,
				dismissKeyAction: false,
				overlayClickAction: false,
				overlayColor: OVERLAY_COLOR,
				beforeTimeout: BEFORE_TIMEOUT_MS,
				targetWaitTimeout: TARGET_WAIT_MS,
			}}
			onEvent={({ type }) => {
				if (type === EVENTS.TOUR_END) {
					moveTo({ screen: 'training', mode: initialMode.current });
					endTour();
				}
			}}
		/>
	);
}

export function GuidedTour() {
	const tour = useUiStore((state) => state.tour);
	if (tour === null) {
		return null;
	}
	return (
		<RunningTour
			key={tour}
			steps={tour === 'visit' ? VISIT_STEPS : WORD_CARD_STEPS}
		/>
	);
}
