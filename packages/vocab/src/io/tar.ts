const BLOCK_SIZE = 512;
const SIZE_OFFSET = 124;
const SIZE_LENGTH = 12;
const OCTAL = 8;

/** Content of the first file of an uncompressed tar archive. */
export function firstFileOfTar(archive: Uint8Array): Uint8Array {
	const sizeField = new TextDecoder()
		.decode(archive.subarray(SIZE_OFFSET, SIZE_OFFSET + SIZE_LENGTH))
		.replace(/\0/g, '')
		.trim();
	const size = Number.parseInt(sizeField, OCTAL);
	if (Number.isNaN(size)) {
		throw new Error('Not a tar archive');
	}
	return archive.subarray(BLOCK_SIZE, BLOCK_SIZE + size);
}
