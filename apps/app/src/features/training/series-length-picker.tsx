import { cn } from '@/lib/utils';

// biome-ignore lint/style/noMagicNumbers: the presets are the values themselves
export const SERIES_LENGTH_PRESETS = [10, 20, 50, 100] as const;

interface SeriesLengthPickerProps {
	readonly length: number;
	readonly onChange: (length: number) => void;
}

export function SeriesLengthPicker({
	length,
	onChange,
}: SeriesLengthPickerProps) {
	return (
		<span className="flex items-center gap-1 text-xs">
			{SERIES_LENGTH_PRESETS.map((preset) => (
				<button
					key={preset}
					type="button"
					onClick={() => onChange(preset)}
					className={cn(
						'rounded px-1.5 py-0.5',
						preset === length
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{preset}
				</button>
			))}
			<span className="text-muted-foreground">· perso</span>
		</span>
	);
}
