import { withWordsPerSession } from '@keyai/core/settings';
import type { MouseEvent } from 'react';
import { KanaTable } from '@/features/kana-table/kana-table.tsx';
import { MobileKanaSheet } from '@/features/kana-table/mobile-kana-sheet.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { wordViewsOf } from './series-view.ts';
import { SeriesWordsRecap } from './series-words-recap.tsx';
import { SessionStatsBar } from './session-stats-bar.tsx';
import { TypingFocusContext } from './typing-focus.tsx';
import { TypingInput } from './typing-input.tsx';
import { useSeries } from './use-series.ts';
import { useTypingInput } from './use-typing-input.ts';
import { WordLine } from './word-line.tsx';

function JapaneseInputWarning() {
	return (
		<p
			role="alert"
			className="rounded-md bg-destructive/10 p-2 text-sm text-destructive"
		>
			⚠ Saisie japonaise active : désactivez-la pour taper en romaji.
		</p>
	);
}

/** Word cards manage the focus; the mobile sheet must not open the keyboard. */
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

export function TrainingScreen() {
	const { series, dispatch, restart } = useSeries();
	const { inputRef, isComposing, focus } = useTypingInput(dispatch);
	const locale = useProgress((state) => state.save.settings.locale);
	const updateSettings = useProgress((state) => state.updateSettings);
	const previous = useUiStore((state) => state.lastSeries);
	const words = wordViewsOf(series.state);

	function changeLength(length: number) {
		updateSettings((settings) => withWordsPerSession(settings, length));
		restart();
		focus();
	}

	return (
		<TypingFocusContext.Provider value={inputRef}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: clicks only restore the focus of the typing input */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard already types in the focused input */}
			<div
				className="relative flex flex-1 flex-col gap-4"
				onClick={refocusOnClick(focus)}
			>
				<TypingInput inputRef={inputRef} />
				<SessionStatsBar
					series={series.state}
					previous={previous}
					onLengthChange={changeLength}
				/>
				<div className="flex flex-1 flex-col justify-center gap-4 py-6">
					<WordLine
						words={words}
						entries={series.entries}
						currentIndex={series.state.currentIndex}
						locale={locale}
						errorCount={series.state.wrongKeyCount}
					/>
					<SeriesWordsRecap
						series={series.state}
						words={words}
						entries={series.entries}
						locale={locale}
					/>
					{isComposing && <JapaneseInputWarning />}
				</div>
				<div className="hidden md:block">
					<KanaTable />
				</div>
				<MobileKanaSheet />
			</div>
		</TypingFocusContext.Provider>
	);
}
