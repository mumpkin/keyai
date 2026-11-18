/**
 * Messages between the app and the speech worker.
 *
 * The worker runs sherpa-onnx (single-threaded wasm) with the ReazonSpeech
 * Zipformer model (see `speech-model.ts`), and the Silero voice activity
 * detector that finds where a word ends.
 */

/** A model file for the in-memory file system of the engine. */
export interface EngineFile {
	readonly name: string;
	readonly data: Uint8Array;
}

export type SpeechRequest =
	/** Starts the engine with the model files. */
	| { readonly type: 'load'; readonly files: readonly EngineFile[] }
	/** Rebuilds the recognizer with these spellings of the expected word. */
	| { readonly type: 'prepare'; readonly hints: readonly string[] }
	/** Microphone samples at 16 kHz, mono. */
	| { readonly type: 'audio'; readonly samples: Float32Array }
	/** Forgets the speech heard so far. */
	| { readonly type: 'reset' };

export type SpeechResponse =
	| { readonly type: 'loaded' }
	| { readonly type: 'prepared' }
	/** The detector heard a voice start. */
	| { readonly type: 'speechStarted' }
	/** The voice stopped: what the recognizer heard. */
	| { readonly type: 'heard'; readonly text: string }
	| { readonly type: 'failed'; readonly message: string };

/** Sample rate of the detector and of the recognizer. */
export const SPEECH_SAMPLE_RATE = 16_000;
