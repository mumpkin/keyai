import captureWorkletUrl from './capture.worklet.ts?worker&url';
import { createResampler } from './resampler.ts';
import { SPEECH_SAMPLE_RATE } from './speech-protocol.ts';

/** A tenth of a second at 16 kHz. */
const BATCH_SAMPLES = 1600;

/** A running microphone; `stop` releases it. */
export interface Microphone {
	stop(): void;
}

/**
 * Opens the microphone and sends its sound, at 16 kHz, to `onSamples`.
 * The audio device keeps its own rate: not every engine can open a
 * 16 kHz context.
 */
export async function startMicrophone(
	onSamples: (samples: Float32Array) => void,
): Promise<Microphone> {
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: {
			channelCount: 1,
			echoCancellation: true,
			noiseSuppression: true,
		},
	});
	const context = new AudioContext();
	try {
		// Firefox starts a context suspended when no click just happened.
		await context.resume();
		await context.audioWorklet.addModule(captureWorkletUrl);
	} catch (error) {
		closeAll(stream, context);
		throw error;
	}
	const source = context.createMediaStreamSource(stream);
	const capture = new AudioWorkletNode(context, 'keyai-capture');
	const resample = createResampler(context.sampleRate, SPEECH_SAMPLE_RATE);
	// The worklet sends 128 frames at a time: batched to spare the worker.
	let batch: number[] = [];
	capture.port.onmessage = ({ data }: MessageEvent<Float32Array>) => {
		batch.push(...resample(data));
		if (batch.length >= BATCH_SAMPLES) {
			onSamples(Float32Array.from(batch));
			batch = [];
		}
	};
	source.connect(capture);
	// The worklet writes nothing: connected only so that every engine runs it.
	capture.connect(context.destination);

	return {
		stop() {
			capture.port.onmessage = null;
			source.disconnect();
			capture.disconnect();
			closeAll(stream, context);
		},
	};
}

function closeAll(stream: MediaStream, context: AudioContext): void {
	for (const track of stream.getTracks()) {
		track.stop();
	}
	void context.close();
}
