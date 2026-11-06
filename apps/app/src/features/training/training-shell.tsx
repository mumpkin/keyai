import { type MouseEvent, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KanaFocusList } from '@/features/kana-table/kana-focus-list.tsx';
import { KanaTable } from '@/features/kana-table/kana-table.tsx';
import { TypingInput } from '@/features/training/typing/typing-input.tsx';
import type { useTypingInput } from '@/features/training/typing/use-typing-input.ts';
import { TypingFocusContext } from '@/features/word-card/typing-focus.tsx';
import { cn } from '@/lib/utils.ts';
import { useUiStore } from '@/stores/ui-store.ts';

function JapaneseInputWarning() {
	const { t: translate } = useTranslation();
	return (
		<p
			role="alert"
			className="absolute inset-x-0 bottom-2 z-10 rounded-md bg-popover p-2 text-sm text-destructive shadow-md ring-1 ring-destructive/40"
		>
			⚠ {translate('training.japaneseInputWarning')}
		</p>
	);
}

/**
 * Keys go nowhere without the focus. Always there and fading in late, so that
 * it neither moves anything nor flashes during an ordinary click.
 */
function FocusLostHint({ isVisible }: { readonly isVisible: boolean }) {
	const { t: translate } = useTranslation();
	return (
		<p
			aria-hidden={!isVisible}
			className={cn(
				'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity motion-reduce:transition-none',
				isVisible ? 'opacity-100 delay-300' : 'opacity-0',
			)}
		>
			<span className="rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
				{translate('training.focusLost')}
			</span>
		</p>
	);
}

/** Word cards manage the focus; the kana list must not open the keyboard. */
const KEEPS_FOCUS = '[data-slot="popover-trigger"], [data-keeps-focus]';

/** Any other click brings the focus back to typing. */
function refocusOnClick(focus: () => void) {
	return (event: MouseEvent) => {
		const target = event.target as Element;
		if (!target.closest(KEEPS_FOCUS)) {
			focus();
		}
	};
}

interface TrainingShellProps {
	readonly typing: ReturnType<typeof useTypingInput>;
	readonly bar: ReactNode;
	readonly line: ReactNode;
	readonly below: ReactNode;
}

/** What the two modes share: the input, the bar, the line and the table. */
export function TrainingShell({
	typing,
	bar,
	line,
	below,
}: TrainingShellProps) {
	const { inputRef, isComposing, isFocusLost, focus } = typing;
	const focusRequests = useUiStore((state) => state.typingFocusRequests);

	useEffect(() => {
		if (focusRequests > 0) {
			inputRef.current?.focus();
		}
	}, [focusRequests, inputRef]);

	return (
		<TypingFocusContext.Provider value={inputRef}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: clicks only restore the focus of the typing input */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard already types in the focused input */}
			<div
				className="relative flex flex-1 flex-col gap-4"
				onClick={refocusOnClick(focus)}
			>
				<TypingInput inputRef={inputRef} />
				{bar}
				<div className="relative flex flex-1 flex-col gap-4 md:justify-center md:py-6">
					<div className="relative" data-tour="line">
						{line}
						<FocusLostHint isVisible={isFocusLost} />
					</div>
					{below}
					{isComposing && <JapaneseInputWarning />}
				</div>
				<div className="hidden md:block">
					<KanaTable />
				</div>
				<div className="md:hidden">
					<KanaFocusList />
				</div>
			</div>
		</TypingFocusContext.Provider>
	);
}
