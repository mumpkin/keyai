import { Placeholder } from '@/features/blocking/placeholder';

const COMPLETED_WORDS = 5;
const SERIES_LENGTH = 20;
const PERCENT = 100;

function SeriesProgress() {
	const progress = (COMPLETED_WORDS / SERIES_LENGTH) * PERCENT;
	return (
		<span className="flex items-center gap-2">
			<span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
				<span
					className="block h-full bg-primary"
					style={{ width: `${progress}%` }}
				/>
			</span>
			{COMPLETED_WORDS}/{SERIES_LENGTH}
		</span>
	);
}

export function SessionStatsBar() {
	return (
		<Placeholder
			label="current series"
			className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
		>
			<SeriesProgress />
			<span>38 kana/min</span>
			<span>96 %</span>
			<span>1 erreur</span>
			<span className="text-muted-foreground">
				précédente : 42 kana/min · 94 %
			</span>
			<span className="rounded-full bg-primary/10 px-2">
				✦ nouveau : <span className="font-kana">く</span>
			</span>
		</Placeholder>
	);
}
