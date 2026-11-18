/**
 * The parts of the sherpa-onnx wasm scripts (`public/speech/`) used by the
 * speech worker. A namespace of types only: nothing leaks into the app.
 */
declare namespace SherpaOnnx {
	interface Stream {
		acceptWaveform(sampleRate: number, samples: Float32Array): void;
		free(): void;
	}

	interface Recognizer {
		createStream(): Stream;
		decode(stream: Stream): void;
		getResult(stream: Stream): { text: string };
		free(): void;
	}

	/** Voice activity detector: cuts the stream into spoken segments. */
	interface Detector {
		acceptWaveform(samples: Float32Array): void;
		isDetected(): boolean;
		isEmpty(): boolean;
		pop(): void;
		reset(): void;
	}

	/** The Emscripten module, with the file system functions it exports. */
	interface Module {
		locateFile?: (path: string) => string;
		onRuntimeInitialized?: () => void;
		// biome-ignore lint/style/useNamingConvention: name set by Emscripten
		FS_createDataFile(
			parent: string,
			name: string,
			data: Uint8Array,
			canRead: boolean,
			canWrite: boolean,
			canOwn: boolean,
		): void;
		// biome-ignore lint/style/useNamingConvention: name set by Emscripten
		FS_unlink(path: string): void;
	}
}
