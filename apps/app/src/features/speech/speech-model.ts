/**
 * The speech model: downloaded once from Hugging Face, kept in the cache,
 * then handed to the worker. The download streams, so the page stays
 * responsive.
 */

/** Pinned revision of reazon-research/reazonspeech-k2-v2 (Apache-2.0). */
const MODEL_REVISION = '291488c8151be24d7da4bf7af26e533fad96e407';
const MODEL_BASE_URL = `https://huggingface.co/reazon-research/reazonspeech-k2-v2/resolve/${MODEL_REVISION}`;
const MODEL_CACHE_NAME = 'keyai-speech-model-291488c8';
/** Same name as in `vite.config.ts`, where the service worker fills it. */
const ENGINE_CACHE_NAME = 'keyai-speech-engine-1.12.36';

export interface ModelFile {
	/** Name in the in-memory file system of the engine. */
	readonly name: string;
	readonly url: string;
	readonly bytes: number;
}

/** A model file read from the cache, ready for the worker. */
export interface LoadedModelFile {
	readonly name: string;
	readonly data: Uint8Array<ArrayBuffer>;
}

export const MODEL_FILES: readonly ModelFile[] = [
	{
		name: 'encoder.onnx',
		url: `${MODEL_BASE_URL}/encoder-epoch-99-avg-1.int8.onnx`,
		bytes: 154_670_139,
	},
	{
		name: 'decoder.onnx',
		url: `${MODEL_BASE_URL}/decoder-epoch-99-avg-1.int8.onnx`,
		bytes: 2_959_337,
	},
	{
		name: 'joiner.onnx',
		url: `${MODEL_BASE_URL}/joiner-epoch-99-avg-1.int8.onnx`,
		bytes: 2_696_970,
	},
	{
		name: 'tokens.txt',
		url: `${MODEL_BASE_URL}/tokens.txt`,
		bytes: 45_754,
	},
];

export const MODEL_TOTAL_BYTES = MODEL_FILES.reduce(
	(sum, file) => sum + file.bytes,
	0,
);

function joined(chunks: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
	const data = new Uint8Array(
		chunks.reduce((sum, chunk) => sum + chunk.length, 0),
	);
	let offset = 0;
	for (const chunk of chunks) {
		data.set(chunk, offset);
		offset += chunk.length;
	}
	return data;
}

/** Downloads a file, reporting every chunk, and keeps it in the cache. */
async function download(
	cache: Cache,
	file: ModelFile,
	onBytes: (count: number) => void,
): Promise<Uint8Array<ArrayBuffer>> {
	const response = await fetch(file.url);
	if (!(response.ok && response.body)) {
		throw new Error(`${response.status} ${file.url}`);
	}
	const chunks: Uint8Array[] = [];
	const reader = response.body.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		chunks.push(value);
		onBytes(value.length);
	}
	const data = joined(chunks);
	await cache.put(file.url, new Response(data));
	return data;
}

export async function isModelDownloaded(): Promise<boolean> {
	const cache = await caches.open(MODEL_CACHE_NAME);
	const found = await Promise.all(
		MODEL_FILES.map((file) => cache.match(file.url)),
	);
	return found.every(Boolean);
}

/** Reads the model from the cache, downloading what is missing. */
export async function readModel(
	onProgress: (fraction: number) => void,
): Promise<LoadedModelFile[]> {
	const cache = await caches.open(MODEL_CACHE_NAME);
	let loadedBytes = 0;
	const report = (count: number) => {
		loadedBytes += count;
		onProgress(loadedBytes / MODEL_TOTAL_BYTES);
	};
	const files: LoadedModelFile[] = [];
	for (const file of MODEL_FILES) {
		const cached = await cache.match(file.url);
		const data = cached
			? new Uint8Array(await cached.arrayBuffer())
			: await download(cache, file, report);
		if (cached) {
			report(data.length);
		}
		files.push({ name: file.name, data });
	}
	return files;
}

/** Frees the space: the model and the engine files of the service worker. */
export async function deleteModel(): Promise<void> {
	await Promise.all([
		caches.delete(MODEL_CACHE_NAME),
		caches.delete(ENGINE_CACHE_NAME),
	]);
}
