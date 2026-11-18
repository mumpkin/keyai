import type { SpokenWord } from '@keyai/core/progression';
import type { WordStatus } from '@keyai/core/session';
import { withWordsPerSession } from '@keyai/core/settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { KanaFocusList } from '@/features/kana-table/kana-focus-list.tsx';
import { KanaTable } from '@/features/kana-table/kana-table.tsx';
import {
	hasModel,
	MODEL_MEGABYTES,
	type ModelStatus,
	useSpeechStore,
} from '@/features/speech/speech-store.ts';
import { InputModePicker } from '@/features/training/bar/input-mode-picker.tsx';
import { SeriesLengthPicker } from '@/features/training/bar/series-length-picker.tsx';
import { TrainingModePicker } from '@/features/training/bar/training-mode-picker.tsx';
import type {
	UnitView,
	WordView,
} from '@/features/training/series/series-view.ts';
import { TypingLine } from '@/features/training/words/word-line.tsx';
import { WordView as WordViewItem } from '@/features/training/words/word-view.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import type { SpokenSeriesResult } from '@/stores/progress-logic.ts';
import type { SpokenSeries } from './spoken-series.ts';
import { useSpokenSeries } from './use-spoken-series.ts';

const PERCENT = 100;

function statusOf(
	ended: SpokenWord | undefined,
	isCurrent: boolean,
): WordStatus {
	if (ended) {
		return ended.skipped ? 'skipped' : 'done';
	}
	return isCurrent ? 'current' : 'pending';
}

function unitStateOf(ended: SpokenWord | undefined): UnitView['state'] {
	if (!ended) {
		return 'pending';
	}
	return ended.heardFirstTry ? 'typed' : 'faulty';
}

/** The words of the line: heard, retried, skipped, current or to come. */
function wordViewsOf(series: SpokenSeries): WordView[] {
	return series.entries.map((entry, index) => {
		const ended = series.words[index];
		return {
			index,
			status: statusOf(ended, index === series.words.length),
			units: entry.units.map((kana, unitIndex) => ({
				id: `${index}-${unitIndex}`,
				kana,
				state: unitStateOf(ended),
			})),
		};
	});
}

function useStatusMessage(series: SpokenSeries): string {
	const { t: translate } = useTranslation();
	if (series.phase === 'preparing') {
		return translate('training.voice.preparing');
	}
	if (series.phase === 'hearing') {
		return translate('training.voice.hearing');
	}
	if (series.lastHeard === null) {
		return translate('training.voice.listening');
	}
	return series.lastHeard === ''
		? translate('training.voice.heardNothing')
		: translate('training.voice.heardWrong', { text: series.lastHeard });
}

function StatusLine({
	series,
	error,
}: {
	readonly series: SpokenSeries;
	readonly error: string | null;
}) {
	const { t: translate } = useTranslation();
	const message = useStatusMessage(series);
	if (error) {
		return (
			<p className="text-sm text-destructive" role="alert">
				{translate('training.voice.failed', { message: error })}
			</p>
		);
	}
	return (
		<p aria-live="polite" className="text-sm text-muted-foreground">
			{message}
		</p>
	);
}

function PreviousSeries({
	result,
}: {
	readonly result: SpokenSeriesResult | null;
}) {
	const { t: translate } = useTranslation();
	if (!result) {
		return translate('training.voice.guide');
	}
	const figures = translate('training.voice.previous', {
		percent: Math.round(result.firstTryRatio * PERCENT),
		speed: Math.round(result.kanaPerMinute),
	});
	return result.unlockedKana
		? `${figures} · ${translate('training.voice.unlocked', { kana: result.unlockedKana })}`
		: figures;
}

function SpokenBar({
	series,
	previous,
	onRestart,
}: {
	readonly series: SpokenSeries;
	readonly previous: SpokenSeriesResult | null;
	readonly onRestart: () => void;
}) {
	const { t: translate } = useTranslation();
	const updateSettings = useProgress((state) => state.updateSettings);
	const firstTry = series.words.filter(
		(word) => word.heardFirstTry && !word.skipped,
	).length;
	const changeLength = (length: number) => {
		updateSettings((settings) => withWordsPerSession(settings, length));
		onRestart();
	};
	return (
		<div className="flex flex-col gap-1 text-sm">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
				<span className="min-w-12">
					{series.words.length}/{series.entries.length}
				</span>
				<span className="min-w-24">
					{translate('training.voice.firstTryCount', {
						count: firstTry,
					})}
				</span>
				<span className="ml-auto flex flex-wrap items-center gap-3">
					<InputModePicker />
					<TrainingModePicker />
					<SeriesLengthPicker
						length={series.entries.length}
						onChange={changeLength}
						onDismiss={() => undefined}
					/>
				</span>
			</div>
			<p className="flex h-5 items-center overflow-hidden whitespace-nowrap text-muted-foreground">
				<PreviousSeries result={previous} />
			</p>
		</div>
	);
}

/** Space skips the word, Escape starts a new series, as when typing. */
function useSeriesKeys(skip: () => void, restart: () => void) {
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as Element | null;
			if (target?.closest('input, textarea, [role$="dialog"]')) {
				return;
			}
			if (event.key === ' ') {
				event.preventDefault();
				skip();
			} else if (event.key === 'Escape') {
				restart();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [skip, restart]);
}

function SpokenSeriesView() {
	const locale = useProgress((state) => state.save.settings.locale);
	const [previous, setPrevious] = useState<SpokenSeriesResult | null>(null);
	const { series, error, skip, restart } = useSpokenSeries(setPrevious);
	useSeriesKeys(skip, restart);
	return (
		<>
			<SpokenBar
				series={series}
				previous={previous}
				onRestart={restart}
			/>
			<div className="relative flex flex-1 flex-col gap-4 md:justify-center md:py-6">
				<TypingLine currentIndex={series.words.length} isJoined={false}>
					{wordViewsOf(series).map((word) => (
						<WordViewItem
							key={word.index}
							word={word}
							entry={series.entries[word.index]}
							locale={locale}
							errorCount={series.misses}
						/>
					))}
				</TypingLine>
				<StatusLine series={series} error={error} />
			</div>
		</>
	);
}

/** Before the first spoken series: the model must be on the device. */
function ModelGate({ status }: { readonly status: ModelStatus }) {
	const { t: translate } = useTranslation();
	const loadModel = useSpeechStore((state) => state.loadModel);
	return (
		<div className="flex flex-col items-start gap-3 rounded-lg border p-4 text-sm">
			<div className="flex w-full justify-end">
				<InputModePicker />
			</div>
			<p>
				{translate('training.voice.needsModel', {
					megabytes: MODEL_MEGABYTES,
				})}
			</p>
			{status.kind === 'loading' ? (
				<p role="status">
					{translate('settings.speech.loading', {
						percent: Math.floor(status.fraction * PERCENT),
					})}
				</p>
			) : (
				<Button onClick={() => void loadModel()}>
					{translate('settings.speech.download', {
						megabytes: MODEL_MEGABYTES,
					})}
				</Button>
			)}
			{status.kind === 'failed' && (
				<p className="text-destructive" role="alert">
					{translate('settings.speech.failed', {
						message: status.message,
					})}
				</p>
			)}
		</div>
	);
}

function SpokenContent({ status }: { readonly status: ModelStatus }) {
	const { t: translate } = useTranslation();
	if (status.kind === 'ready') {
		return <SpokenSeriesView />;
	}
	if (hasModel(status)) {
		return (
			<p className="text-sm text-muted-foreground" role="status">
				{translate('training.voice.loading')}
			</p>
		);
	}
	return <ModelGate status={status} />;
}

/** The word mode read aloud: the microphone instead of the keyboard (C9). */
export function SpokenWordTraining() {
	const status = useSpeechStore((state) => state.status);
	const checkModel = useSpeechStore((state) => state.checkModel);
	const loadModel = useSpeechStore((state) => state.loadModel);

	useEffect(() => {
		void checkModel();
	}, [checkModel]);
	// A model already downloaded loads by itself, from the cache.
	useEffect(() => {
		if (status.kind === 'downloaded') {
			void loadModel();
		}
	}, [status.kind, loadModel]);

	return (
		<div className="relative flex flex-1 flex-col gap-4">
			<SpokenContent status={status} />
			<div className="hidden md:block">
				<KanaTable />
			</div>
			<div className="md:hidden">
				<KanaFocusList />
			</div>
		</div>
	);
}
