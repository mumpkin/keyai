const BEEP_FREQUENCY_HZ = 220;
const BEEP_DURATION_S = 0.08;
const BEEP_VOLUME = 0.08;
const MIN_INTERVAL_MS = 100;

/**
 * Short synthesised beep for wrong keys (A4): no audio file, works offline,
 * at most one beep every 100 ms so that bursts of errors stay bearable.
 */
export function createErrorSound(): { readonly play: () => void } {
	let context: AudioContext | undefined;
	let lastPlayedAt = Number.NEGATIVE_INFINITY;
	return {
		play: () => {
			const now = performance.now();
			if (now - lastPlayedAt < MIN_INTERVAL_MS) {
				return;
			}
			lastPlayedAt = now;
			context ??= new AudioContext();
			const oscillator = context.createOscillator();
			const gain = context.createGain();
			oscillator.frequency.value = BEEP_FREQUENCY_HZ;
			gain.gain.value = BEEP_VOLUME;
			oscillator.connect(gain).connect(context.destination);
			oscillator.start();
			oscillator.stop(context.currentTime + BEEP_DURATION_S);
		},
	};
}
