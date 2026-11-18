import { startMicrophone } from './microphone.ts';
import { deleteModel, isModelDownloaded, readModel } from './speech-model.ts';
import type { SpeechRequest, SpeechResponse } from './speech-protocol.ts';

/** Who receives what the microphone hears. */
export interface SpeechListener {
	readonly onSpeechStarted?: () => void;
	readonly onHeard: (text: string) => void;
}

export interface SpeechEngine {
	/** Is the model in the cache? */
	isDownloaded(): Promise<boolean>;
	/** Downloads the model if needed, then starts the engine. */
	load(onProgress: (fraction: number) => void): Promise<void>;
	/** Deletes the model and the engine files from the cache. */
	remove(): Promise<void>;
	/** Rebuilds the recognizer for a word (about a second). */
	prepare(hints: readonly string[]): Promise<void>;
	/** Opens the microphone; the returned function closes it. */
	listen(listener: SpeechListener): Promise<() => void>;
}

type Answer = 'loaded' | 'prepared';

interface Waiter {
	readonly answer: Answer;
	readonly resolve: () => void;
	readonly reject: (error: Error) => void;
}

/** Requests waiting for their answer from the worker. */
function createWaiters() {
	let waiters: Waiter[] = [];
	return {
		add: (waiter: Waiter) => {
			waiters.push(waiter);
		},
		resolve: (answer: Answer) => {
			const index = waiters.findIndex(
				(waiter) => waiter.answer === answer,
			);
			if (index >= 0) {
				waiters.splice(index, 1)[0]?.resolve();
			}
		},
		rejectAll: (error: Error) => {
			const failed = waiters;
			waiters = [];
			for (const waiter of failed) {
				waiter.reject(error);
			}
		},
	};
}

/** The worker, started on first use, and the requests sent to it. */
function createConnection(dispatch: (response: SpeechResponse) => void) {
	let worker: Worker | undefined;
	return {
		send: (message: SpeechRequest, transfer: Transferable[] = []) => {
			if (!worker) {
				worker = new Worker(
					new URL('./speech.worker.ts', import.meta.url),
					{ type: 'classic' },
				);
				worker.onmessage = ({ data }: MessageEvent<SpeechResponse>) =>
					dispatch(data);
			}
			worker.postMessage(message, transfer);
		},
		/** The model stays in the memory of the worker until it stops. */
		stop: () => {
			worker?.terminate();
			worker = undefined;
		},
	};
}

/**
 * One worker for the whole app: the model takes 160 MB of memory once
 * loaded. Requests wait for their answer; what is heard goes to the
 * current listener.
 */
export function createSpeechEngine(): SpeechEngine {
	let listener: SpeechListener | undefined;
	const waiters = createWaiters();
	const connection = createConnection((response) => {
		if (response.type === 'speechStarted') {
			listener?.onSpeechStarted?.();
		} else if (response.type === 'heard') {
			listener?.onHeard(response.text);
		} else if (response.type === 'failed') {
			waiters.rejectAll(new Error(response.message));
		} else {
			waiters.resolve(response.type);
		}
	});
	const request = (
		message: SpeechRequest,
		answer: Answer,
		transfer: Transferable[] = [],
	) =>
		new Promise<void>((resolve, reject) => {
			waiters.add({ answer, resolve, reject });
			connection.send(message, transfer);
		});

	return {
		isDownloaded: isModelDownloaded,
		load: async (onProgress) => {
			const files = await readModel(onProgress);
			const buffers = files.map((file) => file.data.buffer);
			await request({ type: 'load', files }, 'loaded', buffers);
		},
		remove: async () => {
			await deleteModel();
			connection.stop();
		},
		prepare: (hints) => request({ type: 'prepare', hints }, 'prepared'),
		listen: async (next) => {
			listener = next;
			connection.send({ type: 'reset' });
			const microphone = await startMicrophone((samples) =>
				connection.send({ type: 'audio', samples }, [samples.buffer]),
			);
			return () => {
				microphone.stop();
				if (listener === next) {
					listener = undefined;
				}
			};
		},
	};
}
