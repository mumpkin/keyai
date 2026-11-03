import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SPLASH_DURATION_MS = 3000;
const LEAVE_DURATION_MS = 450;

interface SplashScreenProps {
	readonly onDone: () => void;
}

function SwappingSyllable() {
	return (
		<span className="inline-grid justify-items-end">
			<span className="animate-syllable-out [grid-area:1/1]">ha</span>
			<span className="animate-syllable-in text-primary [grid-area:1/1]">
				ke
			</span>
		</span>
	);
}

function useSplashLifecycle(onDone: () => void) {
	const [isLeaving, setIsLeaving] = useState(false);

	const leave = useCallback(() => setIsLeaving(true), []);

	useEffect(() => {
		const timer = setTimeout(leave, SPLASH_DURATION_MS);
		window.addEventListener('keydown', leave, { once: true });
		return () => {
			clearTimeout(timer);
			window.removeEventListener('keydown', leave);
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

export function SplashScreen({ onDone }: SplashScreenProps) {
	const { isLeaving, leave } = useSplashLifecycle(onDone);

	return (
		<button
			type="button"
			onClick={leave}
			className={cn(
				'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background',
				isLeaving && 'animate-splash-leave',
			)}
		>
			<span className="animate-title-rise text-7xl font-bold tracking-tight">
				<SwappingSyllable />
				yai
			</span>
			<span className="animate-subtitle-reveal font-kana text-lg text-muted-foreground">
				はやい · rapide
			</span>
		</button>
	);
}
