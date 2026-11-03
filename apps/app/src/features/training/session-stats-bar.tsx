import { Placeholder } from '@/features/blocking/placeholder';
import { SeriesLengthPicker } from './series-length-picker';

const PERCENT = 100;

interface SeriesProgressProps {
	readonly completed: number;
	readonly length: number;
}

function SeriesProgress({ completed, length }: SeriesProgressProps) {
	const progress = (completed / length) * PERCENT;
	return (
		<span className="flex items-center gap-2">
			<span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
				<span
					className="block h-full bg-primary"
					style={{ width: `${progress}%` }}
				/>
			</span>
			{completed}/{length}
		</span>
	);
}

interface SessionStatsBarProps {
	readonly completed: number;
	readonly length: number;
	readonly onLengthChange: (length: number) => void;
}

export function SessionStatsBar({
	completed,
	length,
	onLengthChange,
}: SessionStatsBarProps) {
	return (
		<Placeholder
			label="current series"
			className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
		>
			<SeriesProgress completed={completed} length={length} />
			<span>38 kana/min</span>
			<span>96 %</span>
			<span>1 erreur</span>
			<span className="text-muted-foreground">
				précédente : 42 kana/min · 94 %
			</span>
			<span className="rounded-full bg-primary/10 px-2">
				✦ nouveau : <span className="font-kana">く</span>
			</span>
			<span className="ml-auto">
				<SeriesLengthPicker length={length} onChange={onLengthChange} />
			</span>
		</Placeholder>
	);
}
