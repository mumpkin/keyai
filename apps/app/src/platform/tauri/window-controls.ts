import { getCurrentWindow } from '@tauri-apps/api/window';
import type { WindowControls } from '@/platform/types.ts';

export function createTauriWindowControls(): WindowControls {
	const appWindow = getCurrentWindow();
	return {
		minimize: () => appWindow.minimize(),
		toggleMaximize: () => appWindow.toggleMaximize(),
		close: () => appWindow.close(),
		isMaximized: () => appWindow.isMaximized(),
		onResized: (listener) => appWindow.onResized(() => listener()),
	};
}
