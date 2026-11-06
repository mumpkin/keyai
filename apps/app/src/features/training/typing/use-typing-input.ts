import type { SeriesAction } from '@keyai/core/session';
import {
	type RefObject,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from 'react';
import { useUiStore } from '@/stores/ui-store.ts';

/** Kept in the input so that mobile keyboards always have something to delete. */
export const SENTINEL = '​';

/** A tour sits above the series: keys typed meanwhile must not reach it. */
function isTourRunning(): boolean {
	return useUiStore.getState().tour !== null;
}

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

/** Whether a Japanese input method is composing, which needs a warning. */
function useIsComposing(inputRef: RefObject<HTMLInputElement | null>) {
	const [isComposing, setIsComposing] = useState(false);

	useEffect(() => {
		const input = inputRef.current;
		const handleStart = () => setIsComposing(true);
		const handleEnd = () => {
			setIsComposing(false);
			if (input) {
				input.value = SENTINEL;
			}
		};
		input?.addEventListener('compositionstart', handleStart);
		input?.addEventListener('compositionend', handleEnd);
		return () => {
			input?.removeEventListener('compositionstart', handleStart);
			input?.removeEventListener('compositionend', handleEnd);
		};
	}, [inputRef]);

	return isComposing;
}

/**
 * Keyboard capture through a focused, invisible input read with
 * `beforeinput` (A4): it works with physical and mobile virtual keyboards.
 * A Japanese input method is detected through composition events.
 */
export function useTypingInput(
	onAction: (action: SeriesAction) => void,
	/** Returns whether it handled a key of its own (Enter, Tab…). */
	onCommand: (key: string) => boolean = () => false,
) {
	const inputRef = useRef<HTMLInputElement>(null);
	const isComposing = useIsComposing(inputRef);
	const isFocusLost = useIsFocusLost(inputRef);
	const emit = useEffectEvent(onAction);
	const command = useEffectEvent(onCommand);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		const handleBeforeInput = (event: InputEvent) => {
			event.preventDefault();
			if (!(event.isComposing || isTourRunning())) {
				for (const action of actionsOfInput(event)) {
					emit(action);
				}
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isTourRunning()) {
				return;
			}
			const isAbort = event.key === 'Escape';
			if (isAbort) {
				emit({ type: 'abort' });
			}
			if (isAbort || command(event.key)) {
				event.preventDefault();
			}
		};
		input.addEventListener('beforeinput', handleBeforeInput);
		input.addEventListener('keydown', handleKeyDown);
		input.focus();
		return () => {
			input.removeEventListener('beforeinput', handleBeforeInput);
			input.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return {
		inputRef,
		isComposing,
		isFocusLost,
		focus: () => inputRef.current?.focus(),
	};
}
