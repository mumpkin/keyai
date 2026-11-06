import type { SeriesState } from '@keyai/core/session';
import { withWordsPerSession } from '@keyai/core/settings';
import { SeriesLengthPicker } from '@/features/training/bar/series-length-picker.tsx';
import { SessionStatsBar } from '@/features/training/bar/session-stats-bar.tsx';
import {
	recapSourceOf,
	wordViewsOf,
} from '@/features/training/series/series-view.ts';
import { useSeries } from '@/features/training/series/use-series.ts';
import { useTypingInput } from '@/features/training/typing/use-typing-input.ts';
import { SeriesWordsRecap } from '@/features/training/words/series-words-recap.tsx';
import { WordLine } from '@/features/training/words/word-line.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { TrainingShell } from './training-shell.tsx';

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

export function WordTraining() {
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
