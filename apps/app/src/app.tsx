import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { AppHeader } from '@/features/layout/app-header';
import { SaveIssueNotice } from '@/features/layout/save-issue-notice.tsx';
import type { Screen } from '@/features/layout/screen';
import { SettingsScreen } from '@/features/settings/settings-screen';
import { SplashScreen } from '@/features/splash/splash-screen';
import { TrainingScreen } from '@/features/training/training-screen';
import { applyLocale } from '@/i18n/index.ts';
import { isDarkTheme } from '@/lib/theme.ts';
import { useProgress, useStartsWithSplash } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';

/** The charts weigh more than the rest of the app: loaded when needed. */
const StatisticsScreen = lazy(async () => {
	const module = await import('@/features/statistics/statistics-screen.tsx');
	return { default: module.StatisticsScreen };
});

function CurrentScreen({
	screen,
	onReplaySplash,
}: {
	readonly screen: Screen;
	readonly onReplaySplash: () => void;
}) {
	switch (screen) {
		case 'statistics':
			return (
				<Suspense fallback={null}>
					<StatisticsScreen />
				</Suspense>
			);
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

/** Before the first paint, and again when the system theme changes (C6). */
function useTheme() {
	const theme = useProgress((state) => state.save.settings.display.theme);
	useLayoutEffect(() => {
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
		const apply = () =>
			document.documentElement.classList.toggle(
				'dark',
				isDarkTheme(theme, systemDark.matches),
			);
		apply();
		systemDark.addEventListener('change', apply);
		return () => systemDark.removeEventListener('change', apply);
	}, [theme]);
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
	useTheme();

	return (
		<div className="flex h-dvh flex-col">
			{isSplashVisible && (
				<SplashScreen onDone={() => setIsSplashVisible(false)} />
			)}
			<AppHeader currentScreen={screen} onNavigate={navigate} />
			<SaveIssueNotice />
			{/* Only the content scrolls: the header and its scrollbar never meet. */}
			<div className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-gutter:stable] overflow-y-auto">
				<main className="mx-auto flex min-h-full w-full max-w-6xl flex-col p-4">
					<CurrentScreen
						screen={screen}
						onReplaySplash={() => setIsSplashVisible(true)}
					/>
				</main>
			</div>
		</div>
	);
}
