import type { SeriesState } from '@keyai/core/session';
import { useTranslation } from 'react-i18next';
import {
	finishedWordCount,
	liveMeasurementsOf,
} from '@/features/training/series/series-view.ts';
import { cn } from '@/lib/utils.ts';
import { useProgress } from '@/stores/app-context.tsx';
import type { SeriesResult } from '@/stores/progress-logic.ts';
import { SeriesLengthPicker } from './series-length-picker.tsx';

const PERCENT = 100;

function SeriesProgress({
	completed,
	length,
}: {
	readonly completed: number;
	readonly length: number;
}) {
	const progress = length > 0 ? (completed / length) * PERCENT : 0;
	return (
		<span className="flex items-center gap-2">
			<span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
				<span
					className="block h-full bg-primary transition-[width]"
					style={{ width: `${progress}%` }}
				/>
			</span>
			<span className="min-w-12">
				{completed}/{length}
			</span>
		</span>
	);
}

function PreviousSeries({ result }: { readonly result: SeriesResult }) {
	const { t: translate } = useTranslation();
	const { measurements, unlockedKana } = result;
	return (
		<>
			<span className="text-muted-foreground">
				{translate('training.previousSeries', {
					speed: translate('common.speed', {
						value: Math.round(measurements.kanaPerMinute),
					}),
					accuracy: translate('common.percent', {
						value: Math.round(measurements.accuracy * PERCENT),
					}),
				})}
			</span>
			{unlockedKana && (
				<span
					key={unlockedKana}
					className="inline-block animate-unlock-pop rounded-full bg-primary/10 px-2"
				>
					✦ {translate('training.unlocked')}{' '}
					<span lang="ja" className="font-kana">
						{unlockedKana}
					</span>
				</span>
			)}
		</>
	);
}

/** Read by screen readers only: the rest of the bar changes on every key. */
function SeriesAnnouncement({
	result,
}: {
	readonly result: SeriesResult | null;
}) {
	const { t: translate } = useTranslation();
	const speed = result && Math.round(result.measurements.kanaPerMinute);
	const accuracy =
		result && Math.round(result.measurements.accuracy * PERCENT);
	return (
		<p role="status" className="sr-only">
			{result && translate('training.seriesDone', { speed, accuracy })}
			{result?.unlockedKana &&
				` ${translate('training.kanaUnlocked', { kana: result.unlockedKana })}`}
		</p>
	);
}

/** Nothing else tells a newcomer what to do. */
function FirstSeriesGuide() {
	const { t: translate } = useTranslation();
	const isFirstSeries = useProgress(
		(state) => state.save.history.length === 0,
	);
	const naturalWriting = useProgress(
		(state) => state.save.settings.naturalWriting,
	);
	if (!isFirstSeries) {
		return null;
	}
	return (
		<span className="truncate text-muted-foreground">
			<span className="pointer-coarse:hidden">
				{translate(
					naturalWriting
						? 'training.guideNatural'
						: 'training.guideKeyboard',
				)}
			</span>
			<span className="hidden pointer-coarse:inline">
				{translate('training.guideTouch')}
			</span>
		</span>
	);
}

interface SessionStatsBarProps {
	readonly series: SeriesState;
	readonly previous: SeriesResult | null;
	readonly onLengthChange: (length: number) => void;
	readonly onLengthDismiss: () => void;
}

/** Live figures of the current series and the previous one (C8). */
export function SessionStatsBar({
	series,
	previous,
	onLengthChange,
	onLengthDismiss,
}: SessionStatsBarProps) {
	const { t: translate } = useTranslation();
	const live = liveMeasurementsOf(series, performance.now());
	const hasStarted = series.startedAt !== null;
	return (
		<div className="flex flex-col gap-1 text-sm">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
				<SeriesProgress
					completed={finishedWordCount(series)}
					length={series.words.length}
				/>
				<span
					className={cn(
						'min-w-24',
						!hasStarted && 'text-muted-foreground',
					)}
				>
					{translate('common.speed', {
						value: Math.round(live.kanaPerMinute),
					})}
				</span>
				<span
					className={cn(
						'min-w-11',
						!hasStarted && 'text-muted-foreground',
					)}
				>
					{translate('common.percent', {
						value: Math.round(live.accuracy * PERCENT),
					})}
				</span>
				<span className="min-w-20">
					{translate('training.errors', { count: live.errorCount })}
				</span>
				<span className="ml-auto">
					<SeriesLengthPicker
						length={series.words.length}
						onChange={onLengthChange}
						onDismiss={onLengthDismiss}
					/>
				</span>
			</div>
			<SeriesAnnouncement result={previous} />
			{/* Its own line, always there: nothing moves when it fills in. */}
			<div className="flex h-5 items-center gap-4 overflow-hidden whitespace-nowrap">
				{previous ? (
					<PreviousSeries result={previous} />
				) : (
					<FirstSeriesGuide />
				)}
			</div>
		</div>
	);
}
