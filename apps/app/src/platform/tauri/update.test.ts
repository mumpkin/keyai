import { describe, expect, it, vi } from 'vitest';
import { watchForDesktopUpdate } from './update.ts';

describe('watchForDesktopUpdate', () => {
	it('offers nothing when the app is up to date', async () => {
		const onReady = vi.fn();
		await watchForDesktopUpdate(onReady, {
			checkForUpdate: () => Promise.resolve(null),
			restart: () => Promise.resolve(),
		});
		expect(onReady).not.toHaveBeenCalled();
	});

	it('offers nothing when the check fails, as when offline', async () => {
		const onReady = vi.fn();
		await watchForDesktopUpdate(onReady, {
			checkForUpdate: () => Promise.reject(new Error('offline')),
			restart: () => Promise.resolve(),
		});
		expect(onReady).not.toHaveBeenCalled();
	});

	it('downloads nothing until the user asks for it', async () => {
		const downloadAndInstall = vi.fn(() => Promise.resolve());
		const restart = vi.fn(() => Promise.resolve());
		const onReady = vi.fn();
		await watchForDesktopUpdate(onReady, {
			checkForUpdate: () => Promise.resolve({ downloadAndInstall }),
			restart,
		});
		expect(downloadAndInstall).not.toHaveBeenCalled();

		await onReady.mock.calls[0]?.[0]();

		expect(downloadAndInstall).toHaveBeenCalledOnce();
		expect(restart).toHaveBeenCalledOnce();
	});

	it('does not restart when the download fails', async () => {
		const restart = vi.fn(() => Promise.resolve());
		const onReady = vi.fn();
		await watchForDesktopUpdate(onReady, {
			checkForUpdate: () =>
				Promise.resolve({
					downloadAndInstall: () =>
						Promise.reject(new Error('network')),
				}),
			restart,
		});
		await expect(onReady.mock.calls[0]?.[0]()).rejects.toThrow('network');
		expect(restart).not.toHaveBeenCalled();
	});
});
