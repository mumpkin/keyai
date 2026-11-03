import { ChartColumn, Keyboard, type LucideIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Screen } from './screen';

interface NavigationItem {
	readonly screen: Screen;
	readonly label: string;
	readonly icon: LucideIcon;
}

const NAVIGATION: readonly NavigationItem[] = [
	{ screen: 'training', label: 'Entraînement', icon: Keyboard },
	{ screen: 'statistics', label: 'Statistiques', icon: ChartColumn },
	{ screen: 'settings', label: 'Réglages', icon: Settings },
];

interface AppHeaderProps {
	readonly currentScreen: Screen;
	readonly onNavigate: (screen: Screen) => void;
}

export function AppHeader({ currentScreen, onNavigate }: AppHeaderProps) {
	return (
		<header className="flex items-center justify-between border-b px-4 py-3">
			<span className="text-xl font-bold tracking-tight">keyai</span>
			<nav className="flex gap-1">
				{NAVIGATION.map(({ screen, label, icon: Icon }) => (
					<button
						key={screen}
						type="button"
						aria-label={label}
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
						<span className="hidden md:inline">{label}</span>
					</button>
				))}
			</nav>
		</header>
	);
}
