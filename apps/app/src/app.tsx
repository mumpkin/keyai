import { useState } from 'react';
import { AppHeader } from '@/features/layout/app-header';
import type { Screen } from '@/features/layout/screen';
import { SettingsScreen } from '@/features/settings/settings-screen';
import { SplashScreen } from '@/features/splash/splash-screen';
import { StatisticsScreen } from '@/features/statistics/statistics-screen';
import { TrainingScreen } from '@/features/training/training-screen';

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

export function App() {
	const [screen, setScreen] = useState<Screen>('training');
	const [isSplashVisible, setIsSplashVisible] = useState(true);

	return (
		<div className="flex min-h-dvh flex-col">
			{isSplashVisible && (
				<SplashScreen onDone={() => setIsSplashVisible(false)} />
			)}
			<AppHeader currentScreen={screen} onNavigate={setScreen} />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4">
				<CurrentScreen
					screen={screen}
					onReplaySplash={() => setIsSplashVisible(true)}
				/>
			</main>
		</div>
	);
}
