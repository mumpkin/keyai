import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand';
import type { AppDependencies } from '@/bootstrap.ts';
import type { Vocabulary } from '@/vocab/vocabulary.ts';
import type { ProgressState } from './progress-store.ts';

const AppContext = createContext<AppDependencies | null>(null);

export function AppProvider({
	dependencies,
	children,
}: {
	readonly dependencies: AppDependencies;
	readonly children: ReactNode;
}) {
	return (
		<AppContext.Provider value={dependencies}>
			{children}
		</AppContext.Provider>
	);
}

function useAppDependencies(): AppDependencies {
	const dependencies = useContext(AppContext);
	if (!dependencies) {
		throw new Error('AppProvider is missing');
	}
	return dependencies;
}

export function useProgress<Selected>(
	selector: (state: ProgressState) => Selected,
): Selected {
	return useStore(useAppDependencies().progressStore, selector);
}

export function useVocabulary(): Vocabulary {
	return useAppDependencies().vocabulary;
}
