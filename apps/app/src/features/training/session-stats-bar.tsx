import type { SeriesState } from '@keyai/core/session';
import { cn } from '@/lib/utils.ts';
import type { SeriesResult } from '@/stores/progress-logic.ts';
import { SeriesLengthPicker } from './series-length-picker.tsx';
import { finishedWordCount, liveMeasurementsOf } from './series-view.ts';

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
			<span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
				<span
					className="block h-full bg-primary transition-[width]"
					style={{ width: `${progress}%` }}
				/>
			</span>
			{completed}/{length}
		</span>
	);
}

function PreviousSeries({ result }: { readonly result: SeriesResult }) {
	const { measurements, unlockedKana } = result;
	return (
		<>
			<span className="text-muted-foreground">
				précédente : {Math.round(measurements.kanaPerMinute)} kana/min ·{' '}
				{Math.round(measurements.accuracy * PERCENT)} %
			</span>
			{unlockedKana && (
				<span className="rounded-full bg-primary/10 px-2">
					✦ nouveau :{' '}
					<span className="font-kana">{unlockedKana}</span>
				</span>
			)}
		</>
	);
}

interface SessionStatsBarProps {
	readonly series: SeriesState;
	readonly previous: SeriesResult | null;
	readonly onLengthChange: (length: number) => void;
}

/** Live figures of the current series and the previous one (C8). */
export function SessionStatsBar({
	series,
	previous,
	onLengthChange,
}: SessionStatsBarProps) {
	const live = liveMeasurementsOf(series, performance.now());
	const hasStarted = series.startedAt !== null;
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
			<SeriesProgress
				completed={finishedWordCount(series)}
				length={series.words.length}
			/>
			<span className={cn(!hasStarted && 'text-muted-foreground')}>
				{Math.round(live.kanaPerMinute)} kana/min
			</span>
			<span className={cn(!hasStarted && 'text-muted-foreground')}>
				{Math.round(live.accuracy * PERCENT)} %
			</span>
			<span>
				{live.errorCount} erreur{live.errorCount > 1 ? 's' : ''}
			</span>
			{previous && <PreviousSeries result={previous} />}
			<span className="ml-auto">
				<SeriesLengthPicker
					length={series.words.length}
					onChange={onLengthChange}
				/>
			</span>
		</div>
	);
}
