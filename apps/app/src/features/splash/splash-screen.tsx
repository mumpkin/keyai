import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';

const SPLASH_DURATION_MS = 2400;
const LEAVE_DURATION_MS = 300;

interface SplashScreenProps {
	readonly onDone: () => void;
}

/** `ha` rolls up and `ke` takes its place, clipped to the syllable. */
function SwappingSyllable() {
	return (
		<span className="inline-grid justify-items-end overflow-clip">
			<span className="animate-syllable-out [grid-area:1/1]">ha</span>
			<span className="animate-syllable-in [grid-area:1/1]">ke</span>
		</span>
	);
}

function AnimatedTitle() {
	return (
		<span className="animate-title-rise text-7xl font-bold tracking-tight">
			<SwappingSyllable />
			yai
		</span>
	);
}

function useSplashLifecycle(onDone: () => void) {
	const [isLeaving, setIsLeaving] = useState(false);

	const leave = useCallback(() => setIsLeaving(true), []);

	useEffect(() => {
		// The key that skips the splash must not reach the typing input.
		const skip = (event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			leave();
		};
		const timer = setTimeout(leave, SPLASH_DURATION_MS);
		window.addEventListener('keydown', skip, { capture: true });
		return () => {
			clearTimeout(timer);
			window.removeEventListener('keydown', skip, { capture: true });
		};
	}, [leave]);

	useEffect(() => {
		if (!isLeaving) {
			return;
		}
		const timer = setTimeout(onDone, LEAVE_DURATION_MS);
		return () => clearTimeout(timer);
	}, [isLeaving, onDone]);

	return { isLeaving, leave };
}

/** The button must not take the focus away from the typing input. */
function keepFocus(event: MouseEvent) {
	event.preventDefault();
}

export function SplashScreen({ onDone }: SplashScreenProps) {
	const { t: translate } = useTranslation();
	const { isLeaving, leave } = useSplashLifecycle(onDone);

	return (
		<button
			type="button"
			tabIndex={-1}
			onMouseDown={keepFocus}
			onClick={leave}
			className={cn(
				'fixed inset-0 z-50 flex cursor-default flex-col items-center justify-center gap-5 bg-background outline-none',
				isLeaving && 'animate-splash-leave',
			)}
		>
			<AnimatedTitle />
			<span className="animate-subtitle-reveal font-kana text-lg text-muted-foreground">
				<span lang="ja">はやい</span> · {translate('splash.meaning')}
			</span>
		</button>
	);
}
