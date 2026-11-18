/**
 * Audio worklet that hands every block of the microphone to the page.
 * Runs on the audio thread; the page resamples and sends it to the worker.
 */

declare class AudioWorkletProcessor {
	readonly port: MessagePort;
}

declare function registerProcessor(
	name: string,
	processor: new () => AudioWorkletProcessor,
): void;

class CaptureProcessor extends AudioWorkletProcessor {
	process(inputs: Float32Array[][]): boolean {
		const channel = inputs[0]?.[0];
		if (channel) {
			this.port.postMessage(channel.slice());
		}
		return true;
	}
}

registerProcessor('keyai-capture', CaptureProcessor);
