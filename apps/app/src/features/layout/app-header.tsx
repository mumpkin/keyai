import { ChartColumn, Keyboard, type LucideIcon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useWindowControls } from '@/stores/app-context.tsx';
import type { Screen } from './screen';
import { WindowControls } from './window-controls.tsx';

interface NavigationItem {
	readonly screen: Screen;
	readonly icon: LucideIcon;
}

const NAVIGATION: readonly NavigationItem[] = [
	{ screen: 'training', icon: Keyboard },
	{ screen: 'statistics', icon: ChartColumn },
	{ screen: 'settings', icon: Settings },
];

interface AppHeaderProps {
	readonly currentScreen: Screen;
	readonly onNavigate: (screen: Screen) => void;
}

export function AppHeader({ currentScreen, onNavigate }: AppHeaderProps) {
	const { t: translate } = useTranslation();
	const windowControls = useWindowControls();
	return (
		<header
			// Without a system title bar, the whole header moves the window.
			data-tauri-drag-region={windowControls ? 'deep' : undefined}
			className="grid grid-cols-[1fr_auto_1fr] items-center border-b px-4 py-3 select-none"
		>
			<span className="text-xl font-bold tracking-tight">keyai</span>
			<nav
				className={cn(
					'flex gap-1',
					windowControls
						? 'col-start-2'
						: 'col-start-3 justify-self-end',
				)}
			>
				{NAVIGATION.map(({ screen, icon: Icon }) => (
					<button
						key={screen}
						type="button"
						aria-label={translate(`navigation.${screen}`)}
						aria-current={
							screen === currentScreen ? 'page' : undefined
						}
						onClick={() => onNavigate(screen)}
						className={cn(
							'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
							screen === currentScreen
								? 'bg-muted font-medium'
								: 'text-muted-foreground',
						)}
					>
						<Icon className="size-4" />
						<span className="hidden md:inline">
							{translate(`navigation.${screen}`)}
						</span>
					</button>
				))}
			</nav>
			{windowControls && (
				<div className="col-start-3 justify-self-end">
					<WindowControls controls={windowControls} />
				</div>
			)}
		</header>
	);
}
