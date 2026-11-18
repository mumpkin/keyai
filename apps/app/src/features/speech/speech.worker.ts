/// <reference lib="webworker" />
/**
 * Runs sherpa-onnx in a classic worker, so that loading the model and
 * decoding never block the page. The engine scripts are plain scripts
 * served from `public/speech/` (see its NOTICE), hence `importScripts`
 * and the globals (typed in `sherpa-onnx.d.ts`).
 */
// No import statement: a classic worker must not become a module, and
// even a type-only import makes the development transform add `export {}`.
type EngineFile = import('./speech-protocol.ts').EngineFile;
type SpeechRequest = import('./speech-protocol.ts').SpeechRequest;
type SpeechResponse = import('./speech-protocol.ts').SpeechResponse;

const ENGINE_DIRECTORY = '/speech';
const DETECTOR_FILE = 'silero_vad.onnx';
const HINTS_FILE = 'hints.txt';
const SAMPLE_RATE = 16_000;
const FEATURE_DIMENSION = 80;
/** Above 1.5 the recognizer accepts mispronounced words (measured). */
const HINTS_SCORE = 1.0;
const BEAM_PATHS = 4;
/** Window of the Silero detector, in samples. */
const DETECTOR_WINDOW = 512;
const DETECTOR_THRESHOLD = 0.5;
/**
 * Silence that ends a word: 0.3 s cuts the words of a hesitating learner,
 * 0.5 s feels slow. Measured on 108 recordings with the margin below.
 */
const END_SILENCE_SECONDS = 0.4;
const MINIMUM_SPEECH_SECONDS = 0.1;
const MAXIMUM_SPEECH_SECONDS = 10;
/**
 * The detector notices a voice late: the word is cut from 0.4 s before.
 * Its own segment loses the start (がっこう heard ここ).
 */
const MARGIN_SAMPLES = 6400;
/** A short silence around a word helps the recognizer (measured). */
const PADDING_SAMPLES = 4800;

declare const self: DedicatedWorkerGlobalScope & {
	// biome-ignore lint/style/useNamingConvention: global read by Emscripten
	Module: SherpaOnnx.Module;
};
declare const OfflineRecognizer: new (
	config: object,
	module: SherpaOnnx.Module,
) => SherpaOnnx.Recognizer;
declare function createVad(
	module: SherpaOnnx.Module,
	config: object,
): SherpaOnnx.Detector;

let engine: SherpaOnnx.Module | undefined;
let recognizer: SherpaOnnx.Recognizer | undefined;
let detector: SherpaOnnx.Detector | undefined;
/** The sound since the last word, kept to cut the next one with a margin. */
let recent: Float32Array = new Float32Array(0);
/** How much of `recent` the detector has read. */
let fed = 0;
/** Where the current word starts in `recent`, while someone speaks. */
let speechStart: number | undefined;

function reply(response: SpeechResponse): void {
	self.postMessage(response);
}

function startEngine(): Promise<SherpaOnnx.Module> {
	return new Promise((resolve) => {
		self.Module = {
			locateFile: (path) => `${ENGINE_DIRECTORY}/${path}`,
			onRuntimeInitialized: () => resolve(self.Module),
		} as SherpaOnnx.Module;
		self.importScripts(
			`${ENGINE_DIRECTORY}/sherpa-onnx-asr.js`,
			`${ENGINE_DIRECTORY}/sherpa-onnx-vad.js`,
			`${ENGINE_DIRECTORY}/sherpa-onnx-wasm-main-vad-asr.js`,
		);
	});
}

function writeFile(module: SherpaOnnx.Module, name: string, data: Uint8Array) {
	module.FS_createDataFile('/', name, data, true, true, false);
}

function createDetector(module: SherpaOnnx.Module): SherpaOnnx.Detector {
	return createVad(module, {
		sileroVad: {
			model: `/${DETECTOR_FILE}`,
			threshold: DETECTOR_THRESHOLD,
			minSilenceDuration: END_SILENCE_SECONDS,
			minSpeechDuration: MINIMUM_SPEECH_SECONDS,
			maxSpeechDuration: MAXIMUM_SPEECH_SECONDS,
			windowSize: DETECTOR_WINDOW,
		},
		tenVad: { model: '' },
		sampleRate: SAMPLE_RATE,
		numThreads: 1,
		provider: 'cpu',
		debug: 0,
		bufferSizeInSeconds: MAXIMUM_SPEECH_SECONDS,
	});
}

async function load(files: readonly EngineFile[]): Promise<void> {
	if (engine) {
		reply({ type: 'loaded' });
		return;
	}
	const started = await startEngine();
	for (const file of files) {
		writeFile(started, file.name, file.data);
	}
	const detectorModel = await fetch(`${ENGINE_DIRECTORY}/${DETECTOR_FILE}`);
	writeFile(
		started,
		DETECTOR_FILE,
		new Uint8Array(await detectorModel.arrayBuffer()),
	);
	writeFile(started, HINTS_FILE, new TextEncoder().encode('\n'));
	detector = createDetector(started);
	engine = started;
	reply({ type: 'loaded' });
}

function reset(): void {
	detector?.reset();
	recent = new Float32Array(0);
	fed = 0;
	speechStart = undefined;
}

/**
 * Hints only work from a file read when the recognizer is created
 * (`setConfig` and `hotwordsBuf` are ignored), so it is rebuilt for each
 * word, in about a second.
 */
function prepare(hints: readonly string[]): void {
	if (!engine) {
		throw new Error('The speech engine is not loaded');
	}
	recognizer?.free();
	engine.FS_unlink(`/${HINTS_FILE}`);
	writeFile(
		engine,
		HINTS_FILE,
		new TextEncoder().encode(`${hints.join('\n')}\n`),
	);
	recognizer = new OfflineRecognizer(
		{
			featConfig: {
				sampleRate: SAMPLE_RATE,
				featureDim: FEATURE_DIMENSION,
			},
			modelConfig: {
				transducer: {
					encoder: '/encoder.onnx',
					decoder: '/decoder.onnx',
					joiner: '/joiner.onnx',
				},
				tokens: '/tokens.txt',
				numThreads: 1,
				provider: 'cpu',
				modelType: 'transducer',
				modelingUnit: 'cjkchar',
				debug: 0,
			},
			decodingMethod: 'modified_beam_search',
			maxActivePaths: BEAM_PATHS,
			hotwordsFile: `/${HINTS_FILE}`,
			hotwordsScore: HINTS_SCORE,
		},
		engine,
	);
	reset();
	reply({ type: 'prepared' });
}

function recognize(samples: Float32Array): string {
	if (!recognizer) {
		throw new Error('The recognizer is not prepared');
	}
	const padded = new Float32Array(samples.length + 2 * PADDING_SAMPLES);
	padded.set(samples, PADDING_SAMPLES);
	const stream = recognizer.createStream();
	stream.acceptWaveform(SAMPLE_RATE, padded);
	recognizer.decode(stream);
	const { text } = recognizer.getResult(stream);
	stream.free();
	return text;
}

function appended(samples: Float32Array): Float32Array {
	const longer = new Float32Array(recent.length + samples.length);
	longer.set(recent);
	longer.set(samples, recent.length);
	return longer;
}

/** Reads one window; at the end of a word, decodes it with its margin. */
function feedWindow(reader: SherpaOnnx.Detector): void {
	reader.acceptWaveform(recent.subarray(fed, fed + DETECTOR_WINDOW));
	if (reader.isDetected() && speechStart === undefined) {
		speechStart = Math.max(0, fed - MARGIN_SAMPLES);
		reply({ type: 'speechStarted' });
	}
	fed += DETECTOR_WINDOW;
	if (reader.isEmpty()) {
		return;
	}
	while (!reader.isEmpty()) {
		reader.pop();
	}
	const word = recent.subarray(speechStart ?? 0, fed);
	speechStart = undefined;
	reply({ type: 'heard', text: recognize(word) });
}

/**
 * The detector only tells when a voice starts and stops: the word is cut
 * from `recent`, which keeps a margin of sound before it.
 */
function listen(samples: Float32Array): void {
	if (!detector) {
		return;
	}
	recent = appended(samples);
	while (fed + DETECTOR_WINDOW <= recent.length) {
		feedWindow(detector);
	}
	if (speechStart === undefined) {
		const kept = Math.max(0, fed - MARGIN_SAMPLES);
		recent = recent.slice(kept);
		fed -= kept;
	}
}

async function handle(request: SpeechRequest): Promise<void> {
	switch (request.type) {
		case 'load':
			await load(request.files);
			return;
		case 'prepare':
			prepare(request.hints);
			return;
		case 'audio':
			listen(request.samples);
			return;
		default:
			reset();
	}
}

self.onmessage = (event: MessageEvent<SpeechRequest>) => {
	handle(event.data).catch((error: unknown) =>
		reply({
			type: 'failed',
			message: error instanceof Error ? error.message : String(error),
		}),
	);
};
