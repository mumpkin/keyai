import { cva } from 'class-variance-authority';
import type { KanaState, SampleKana } from '@/features/blocking/sample-kana';

const cellVariants = cva(
	'group relative flex h-12 w-12 flex-col items-center justify-center rounded-md border font-kana text-xl focus-visible:outline-2',
	{
		variants: {
			state: {
				locked: 'border-transparent text-muted-foreground/30',
				learning: 'border-border bg-card',
				mastered: 'border-border bg-primary/10',
				latest: 'border-primary bg-primary/20 ring-2 ring-primary',
				next: 'border-2 border-dashed border-primary/60 text-muted-foreground',
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

const ROMAJI_ALWAYS_VISIBLE = new Set<KanaState>([
	'learning',
	'latest',
	'next',
]);

const STATE_BADGES: Partial<Record<KanaState, string>> = {
	latest: 'nouveau',
	next: 'suivant',
};

interface KanaCellProps {
	readonly cell: SampleKana | null;
}

export function KanaCell({ cell }: KanaCellProps) {
	if (!cell) {
		return <span className="h-12 w-12" />;
	}
	const romajiVisibility = ROMAJI_ALWAYS_VISIBLE.has(cell.state)
		? 'always'
		: 'onHover';

	return (
		<button
			type="button"
			className={cellVariants({ state: cell.state })}
			title={cell.romaji}
		>
			{STATE_BADGES[cell.state] && (
				<span className="absolute -top-2 rounded bg-primary px-1 font-sans text-[8px] text-primary-foreground">
					{STATE_BADGES[cell.state]}
				</span>
			)}
			{cell.kana}
			<span className={romajiVariants({ visibility: romajiVisibility })}>
				{cell.romaji}
			</span>
		</button>
	);
}
