import type { SeriesAction } from '@keyai/core/session';
import {
	type RefObject,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from 'react';

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

/** Whether the keys go nowhere; another window gives the focus back itself. */
function useIsFocusLost(inputRef: RefObject<HTMLInputElement | null>) {
	const [isFocusLost, setIsFocusLost] = useState(false);

	useEffect(() => {
		const input = inputRef.current;
		const handleBlur = (event: FocusEvent) =>
			setIsFocusLost(event.relatedTarget === null && document.hasFocus());
		const handleFocus = () => setIsFocusLost(false);
		input?.addEventListener('blur', handleBlur);
		input?.addEventListener('focus', handleFocus);
		return () => {
			input?.removeEventListener('blur', handleBlur);
			input?.removeEventListener('focus', handleFocus);
		};
	}, [inputRef]);

	return isFocusLost;
}

/**
 * Keyboard capture through a focused, invisible input read with
 * `beforeinput` (A4): it works with physical and mobile virtual keyboards.
 * A Japanese input method is detected through composition events.
 */
export function useTypingInput(onAction: (action: SeriesAction) => void) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isComposing, setIsComposing] = useState(false);
	const isFocusLost = useIsFocusLost(inputRef);
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
		isFocusLost,
		focus: () => inputRef.current?.focus(),
	};
}
