import { QuoteDisplayPicker } from '@/features/training/bar/quote-display-picker.tsx';
import { QuoteLengthPicker } from '@/features/training/bar/quote-length-picker.tsx';
import { SessionStatsBar } from '@/features/training/bar/session-stats-bar.tsx';
import { QuoteLine } from '@/features/training/quotes/quote-line.tsx';
import { QuoteResult } from '@/features/training/quotes/quote-result.tsx';
import { useQuoteSeries } from '@/features/training/quotes/use-quote-series.ts';
import { useTypingInput } from '@/features/training/typing/use-typing-input.ts';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { TrainingShell } from './training-shell.tsx';

const QUOTE_KEYS: ReadonlyMap<string, 'next' | 'replay'> = new Map([
	['Enter', 'next'],
	['Tab', 'replay'],
]);

export function QuoteTraining() {
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
