import { registerSW } from 'virtual:pwa-register';

/** The service worker caches the app and warns when a new version is ready. */
export function watchForWebUpdate(onReady: (apply: () => void) => void): void {
	const applyUpdate = registerSW({
		onNeedRefresh: () => onReady(() => void applyUpdate(true)),
	});
}
