import { create } from 'zustand';
import { createSpeechEngine, type SpeechEngine } from './speech-engine.ts';

/** Where the speech model stands. Never saved: the cache is the truth. */
export type ModelStatus =
	| { readonly kind: 'unknown' }
	| { readonly kind: 'absent' }
	| { readonly kind: 'downloaded' }
	| {
			readonly kind: 'loading';
			readonly fraction: number;
			/** Read from the cache, not downloaded. */
			readonly fromCache: boolean;
	  }
	| { readonly kind: 'ready' }
	| { readonly kind: 'failed'; readonly message: string };

export interface SpeechState {
	readonly status: ModelStatus;
	readonly engine: SpeechEngine;
	/** Reads the cache once, to know whether the model is there. */
	readonly checkModel: () => Promise<void>;
	/** Downloads the model if needed and starts the engine. */
	readonly loadModel: () => Promise<void>;
	readonly deleteModel: () => Promise<void>;
}

/** Whether the model is on the device, even while it loads. */
export function hasModel(status: ModelStatus): boolean {
	return (
		status.kind === 'downloaded' ||
		status.kind === 'ready' ||
		(status.kind === 'loading' && status.fromCache)
	);
}

/** Download size announced to the user, in megabytes. */
export const MODEL_MEGABYTES = 160;

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export const useSpeechStore = create<SpeechState>()((set, get) => ({
	status: { kind: 'unknown' },
	engine: createSpeechEngine(),
	checkModel: async () => {
		if (get().status.kind !== 'unknown') {
			return;
		}
		try {
			const downloaded = await get().engine.isDownloaded();
			set({ status: { kind: downloaded ? 'downloaded' : 'absent' } });
		} catch (error) {
			set({ status: { kind: 'failed', message: messageOf(error) } });
		}
	},
	loadModel: async () => {
		if (get().status.kind === 'ready') {
			return;
		}
		const fromCache = get().status.kind === 'downloaded';
		set({ status: { kind: 'loading', fraction: 0, fromCache } });
		try {
			await get().engine.load((fraction) =>
				set({ status: { kind: 'loading', fraction, fromCache } }),
			);
			set({ status: { kind: 'ready' } });
		} catch (error) {
			set({ status: { kind: 'failed', message: messageOf(error) } });
		}
	},
	deleteModel: async () => {
		await get().engine.remove();
		set({ status: { kind: 'absent' } });
	},
}));
