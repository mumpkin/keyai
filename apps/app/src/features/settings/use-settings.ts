import { useProgress } from '@/stores/app-context.tsx';

export function useSettings() {
	const settings = useProgress((state) => state.save.settings);
	const updateSettings = useProgress((state) => state.updateSettings);
	return { settings, updateSettings };
}
