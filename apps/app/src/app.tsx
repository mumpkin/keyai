import { useEffect, useState } from 'react';
import { AppHeader } from '@/features/layout/app-header';
import type { Screen } from '@/features/layout/screen';
import { SettingsScreen } from '@/features/settings/settings-screen';
import { SplashScreen } from '@/features/splash/splash-screen';
import { StatisticsScreen } from '@/features/statistics/statistics-screen';
import { TrainingScreen } from '@/features/training/training-screen';
import { applyLocale } from '@/i18n/index.ts';
import { useProgress, useStartsWithSplash } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';

function CurrentScreen({
	screen,
	onReplaySplash,
}: {
	readonly screen: Screen;
	readonly onReplaySplash: () => void;
}) {
	switch (screen) {
		case 'statistics':
			return <StatisticsScreen />;
		case 'settings':
			return <SettingsScreen onReplaySplash={onReplaySplash} />;
		default:
			return <TrainingScreen />;
	}
}

/** Applies the kana size of the settings to the whole interface (C8). */
function useKanaSize() {
	const kanaSizePx = useProgress(
		(state) => state.save.settings.display.kanaSizePx,
	);
	useEffect(() => {
		document.documentElement.style.setProperty(
			'--kana-size',
			`${kanaSizePx}px`,
		);
	}, [kanaSizePx]);
}

/** Follows the language of the settings, whatever changed it (C6). */
function useInterfaceLanguage() {
	const locale = useProgress((state) => state.save.settings.locale);
	useEffect(() => applyLocale(locale), [locale]);
}

export function App() {
	const screen = useUiStore((state) => state.screen);
	const navigate = useUiStore((state) => state.navigate);
	const [isSplashVisible, setIsSplashVisible] = useState(
		useStartsWithSplash(),
	);
	useKanaSize();
	useInterfaceLanguage();

	return (
		<div className="flex min-h-dvh flex-col">
			{isSplashVisible && (
				<SplashScreen onDone={() => setIsSplashVisible(false)} />
			)}
			<AppHeader currentScreen={screen} onNavigate={navigate} />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4">
				<CurrentScreen
					screen={screen}
					onReplaySplash={() => setIsSplashVisible(true)}
				/>
			</main>
		</div>
	);
}
