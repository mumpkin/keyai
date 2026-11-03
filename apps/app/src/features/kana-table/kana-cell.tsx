import { cva } from 'class-variance-authority';
import type { SampleKana } from '@/features/blocking/sample-kana';

const cellVariants = cva(
	'group flex h-12 w-12 flex-col items-center justify-center rounded-md border font-kana text-xl focus-visible:outline-2',
	{
		variants: {
			state: {
				locked: 'border-transparent text-muted-foreground/30',
				learning: 'border-border bg-card',
				mastered: 'border-border bg-primary/10',
				latest: 'border-primary bg-primary/20 ring-2 ring-primary',
			},
		},
	},
);

const romajiVariants = cva('font-sans text-[10px] text-muted-foreground', {
	variants: {
		visibility: {
			always: 'visible',
			onHover:
				'invisible group-hover:visible group-focus-visible:visible',
		},
	},
});

interface KanaCellProps {
	readonly cell: SampleKana | null;
}

export function KanaCell({ cell }: KanaCellProps) {
	if (!cell) {
		return <span className="h-12 w-12" />;
	}
	const romajiVisibility =
		cell.state === 'learning' || cell.state === 'latest'
			? 'always'
			: 'onHover';

	return (
		<button
			type="button"
			className={cellVariants({ state: cell.state })}
			title={cell.romaji}
		>
			{cell.kana}
			<span className={romajiVariants({ visibility: romajiVisibility })}>
				{cell.romaji}
			</span>
		</button>
	);
}
