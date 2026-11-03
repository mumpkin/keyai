import { useEffect } from 'react';

const SPLASH_DURATION_MS = 2600;

interface SplashScreenProps {
	readonly onDone: () => void;
}

function SwappingSyllable() {
	return (
		<span className="relative inline-flex h-[1.2em] flex-col overflow-hidden align-bottom">
			<span className="animate-syllable-swap leading-[1.2em]">ha</span>
			<span className="animate-syllable-swap leading-[1.2em] text-primary">
				ke
			</span>
		</span>
	);
}

export function SplashScreen({ onDone }: SplashScreenProps) {
	useEffect(() => {
		const timer = setTimeout(onDone, SPLASH_DURATION_MS);
		window.addEventListener('keydown', onDone, { once: true });
		return () => {
			clearTimeout(timer);
			window.removeEventListener('keydown', onDone);
		};
	}, [onDone]);

	return (
		<button
			type="button"
			onClick={onDone}
			className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background"
		>
			<span className="animate-in text-6xl font-bold tracking-tight duration-500 fade-in">
				<SwappingSyllable />
				yai
			</span>
			<span className="animate-in font-kana text-xl text-muted-foreground delay-1000 duration-700 fill-mode-backwards fade-in">
				はやい — rapide
			</span>
		</button>
	);
}
