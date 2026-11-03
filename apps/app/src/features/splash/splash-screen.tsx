import { useEffect } from 'react';

const SPLASH_DURATION_MS = 1500;

interface SplashScreenProps {
	readonly onDone: () => void;
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
			className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-background"
		>
			<span className="animate-in text-6xl font-bold tracking-tight duration-700 zoom-in-50 fade-in motion-reduce:zoom-in-100">
				keyai
			</span>
			<span className="animate-in font-kana text-xl text-muted-foreground delay-300 duration-700 fill-mode-backwards fade-in">
				かなを よもう
			</span>
		</button>
	);
}
