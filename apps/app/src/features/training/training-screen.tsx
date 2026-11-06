import type { SeriesState } from '@keyai/core/session';
import { withWordsPerSession } from '@keyai/core/settings';
import { type MouseEvent, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KanaFocusList } from '@/features/kana-table/kana-focus-list.tsx';
import { KanaTable } from '@/features/kana-table/kana-table.tsx';
import { QuoteDisplayPicker } from '@/features/training/bar/quote-display-picker.tsx';
import { QuoteLengthPicker } from '@/features/training/bar/quote-length-picker.tsx';
import { SeriesLengthPicker } from '@/features/training/bar/series-length-picker.tsx';
import { SessionStatsBar } from '@/features/training/bar/session-stats-bar.tsx';
import { QuoteLine } from '@/features/training/quotes/quote-line.tsx';
import { QuoteResult } from '@/features/training/quotes/quote-result.tsx';
import { useQuoteSeries } from '@/features/training/quotes/use-quote-series.ts';
import {
	recapSourceOf,
	wordViewsOf,
} from '@/features/training/series/series-view.ts';
import { useSeries } from '@/features/training/series/use-series.ts';
import { TypingInput } from '@/features/training/typing/typing-input.tsx';
import { useTypingInput } from '@/features/training/typing/use-typing-input.ts';
import { SeriesWordsRecap } from '@/features/training/words/series-words-recap.tsx';
import { WordLine } from '@/features/training/words/word-line.tsx';
import { TypingFocusContext } from '@/features/word-card/typing-focus.tsx';
import { cn } from '@/lib/utils.ts';
import { useProgress } from '@/stores/app-context.tsx';
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
function TrainingShell({ typing, bar, line, below }: TrainingShellProps) {
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

function WordBar({
	series,
	onRestart,
	focus,
}: {
	readonly series: SeriesState;
	readonly onRestart: () => void;
	readonly focus: () => void;
}) {
	const updateSettings = useProgress((state) => state.updateSettings);
	const previous = useUiStore((state) => state.lastSeries);

	function changeLength(length: number) {
		updateSettings((settings) => withWordsPerSession(settings, length));
		onRestart();
		focus();
	}

	return (
		<SessionStatsBar
			series={series}
			previous={previous}
			lengthPicker={
				<SeriesLengthPicker
					length={series.words.length}
					onChange={changeLength}
					onDismiss={focus}
				/>
			}
		/>
	);
}

function WordTraining() {
	const { series, dispatch, restart } = useSeries();
	const typing = useTypingInput(dispatch);
	const locale = useProgress((state) => state.save.settings.locale);
	const keepsWordSpaces = useProgress(
		(state) => state.save.settings.keepsWordSpaces,
	);
	const words = wordViewsOf(series.state);
	const recap = recapSourceOf(series);
	return (
		<TrainingShell
			typing={typing}
			bar={
				<WordBar
					series={series.state}
					onRestart={restart}
					focus={typing.focus}
				/>
			}
			line={
				<WordLine
					words={words}
					entries={series.entries}
					currentIndex={series.state.currentIndex}
					locale={locale}
					errorCount={series.state.currentWordErrors}
					isJoined={series.state.naturalWriting && !keepsWordSpaces}
				/>
			}
			below={
				<SeriesWordsRecap
					series={recap.state}
					words={wordViewsOf(recap.state)}
					entries={recap.entries}
					locale={locale}
				/>
			}
		/>
	);
}

const QUOTE_KEYS: ReadonlyMap<string, 'next' | 'replay'> = new Map([
	['Enter', 'next'],
	['Tab', 'replay'],
]);

function QuoteTraining() {
	const { series, dispatch, next, replay } = useQuoteSeries();
	const isFinished = series.state.phase === 'finished';
	const typing = useTypingInput(dispatch, (key) => {
		const command = isFinished ? QUOTE_KEYS.get(key) : undefined;
		if (command) {
			({ next, replay })[command]();
		}
		return command !== undefined;
	});
	const { locale, quote } = useProgress((state) => state.save.settings);
	const previous = useUiStore((state) => state.lastSeries);
	const thenFocus = (action: () => void) => () => {
		action();
		typing.focus();
	};
	return (
		<TrainingShell
			typing={typing}
			bar={
				<SessionStatsBar
					series={series.state}
					previous={previous}
					lengthPicker={
						<>
							<QuoteDisplayPicker onChange={thenFocus(replay)} />
							<QuoteLengthPicker onChange={thenFocus(next)} />
						</>
					}
				/>
			}
			line={
				<QuoteLine
					series={series}
					locale={locale}
					isJoined={!quote.keepsSpaces}
				/>
			}
			below={
				<QuoteResult
					quote={series.quote}
					locale={locale}
					isFinished={isFinished}
					onNext={next}
					onReplay={replay}
				/>
			}
		/>
	);
}

export function TrainingScreen() {
	const mode = useProgress((state) => state.save.settings.trainingMode);
	return mode === 'quotes' ? <QuoteTraining /> : <WordTraining />;
}
