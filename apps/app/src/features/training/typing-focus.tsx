import { createContext, type RefObject, useContext } from 'react';

/** The hidden typing input, where focus returns after a word card. */
export const TypingFocusContext =
	createContext<RefObject<HTMLInputElement | null> | null>(null);

export function useTypingFocus(): RefObject<HTMLInputElement | null> | null {
	return useContext(TypingFocusContext);
}
