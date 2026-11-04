import type { RefObject } from 'react';
import { SENTINEL } from './use-typing-input.ts';

/** The focused, invisible input that receives the keys (A4). */
export function TypingInput({
	inputRef,
}: {
	readonly inputRef: RefObject<HTMLInputElement | null>;
}) {
	return (
		<input
			ref={inputRef}
			aria-label="Zone de frappe"
			defaultValue={SENTINEL}
			autoComplete="off"
			autoCorrect="off"
			autoCapitalize="off"
			spellCheck={false}
			inputMode="text"
			className="pointer-events-none absolute top-0 left-0 size-px text-base opacity-0"
		/>
	);
}
