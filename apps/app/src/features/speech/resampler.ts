/**
 * Converts the microphone stream to the rate of the recognizer, chunk by
 * chunk, by linear interpolation. Enough for speech below 8 kHz; the
 * position carries over from one chunk to the next, so chunk edges leave
 * no gap.
 */
export function createResampler(
	fromRate: number,
	toRate: number,
): (chunk: Float32Array) => Float32Array {
	const step = fromRate / toRate;
	/** Position of the next output sample, in input samples. */
	let position = 0;
	let previous = 0;

	return (chunk) => {
		const output: number[] = [];
		// Index -1 stands for the last sample of the previous chunk.
		while (position < chunk.length - 1) {
			const index = Math.floor(position);
			const fraction = position - index;
			const before = index < 0 ? previous : (chunk[index] ?? 0);
			const after = chunk[index + 1] ?? before;
			output.push(before + (after - before) * fraction);
			position += step;
		}
		position -= chunk.length;
		previous = chunk.at(-1) ?? previous;
		return Float32Array.from(output);
	};
}
