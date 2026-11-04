import { ChartColumn, Keyboard, type LucideIcon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Screen } from './screen';

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
	return (
		<header className="flex items-center justify-between border-b px-4 py-3">
			<span className="text-xl font-bold tracking-tight">keyai</span>
			<nav className="flex gap-1">
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
		</header>
	);
}
