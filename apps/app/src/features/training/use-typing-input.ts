import type { SeriesAction } from '@keyai/core/session';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

/** Kept in the input so that mobile keyboards always have something to delete. */
export const SENTINEL = '​';

function actionsOf(text: string, at: number): SeriesAction[] {
	return [...text].map((character) =>
		character === ' '
			? { type: 'space', at }
			: { type: 'key', key: character, at },
	);
}

function actionsOfInput(event: InputEvent): SeriesAction[] {
	const at = performance.now();
	if (event.inputType === 'deleteContentBackward') {
		return [{ type: 'backspace', at }];
	}
	return event.inputType.startsWith('insert') && event.data
		? actionsOf(event.data, at)
		: [];
}

/**
 * Keyboard capture through a focused, invisible input read with
 * `beforeinput` (A4): it works with physical and mobile virtual keyboards.
 * A Japanese input method is detected through composition events.
 */
export function useTypingInput(onAction: (action: SeriesAction) => void) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isComposing, setIsComposing] = useState(false);
	const emit = useEffectEvent(onAction);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		const handleBeforeInput = (event: InputEvent) => {
			event.preventDefault();
			if (!event.isComposing) {
				for (const action of actionsOfInput(event)) {
					emit(action);
				}
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				emit({ type: 'abort' });
			}
		};
		const handleCompositionStart = () => setIsComposing(true);
		const handleCompositionEnd = () => {
			setIsComposing(false);
			input.value = SENTINEL;
		};
		input.addEventListener('beforeinput', handleBeforeInput);
		input.addEventListener('keydown', handleKeyDown);
		input.addEventListener('compositionstart', handleCompositionStart);
		input.addEventListener('compositionend', handleCompositionEnd);
		input.focus();
		return () => {
			input.removeEventListener('beforeinput', handleBeforeInput);
			input.removeEventListener('keydown', handleKeyDown);
			input.removeEventListener(
				'compositionstart',
				handleCompositionStart,
			);
			input.removeEventListener('compositionend', handleCompositionEnd);
		};
	}, []);

	return {
		inputRef,
		isComposing,
		focus: () => inputRef.current?.focus(),
	};
}
