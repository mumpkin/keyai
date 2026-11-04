import { findKana } from '@keyai/core/kana';
import { cva } from 'class-variance-authority';
import type { KanaDisplayState } from './kana-states.ts';

const cellVariants = cva(
	'group relative flex size-11 flex-col items-center justify-center rounded-md border font-kana text-lg focus-visible:outline-2',
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

/** Romaji helps while a kana is learned; it hides once mastered (C8). */
const ROMAJI_ALWAYS_VISIBLE = new Set<KanaDisplayState>([
	'learning',
	'latest',
	'next',
]);

const STATE_BADGES: Partial<Record<KanaDisplayState, string>> = {
	latest: 'nouveau',
	next: 'suivant',
};

function romajiOf(kana: string): string {
	const unit = findKana(kana);
	if (unit?.kind === 'sokuon') {
		return '(×2)';
	}
	return unit?.romaji.display ?? '';
}

interface KanaCellProps {
	readonly kana: string | null;
	readonly state: KanaDisplayState;
}

export function KanaCell({ kana, state }: KanaCellProps) {
	if (!kana) {
		return <span className="size-11" />;
	}
	const badge = STATE_BADGES[state];
	return (
		<button
			type="button"
			className={cellVariants({ state })}
			title={romajiOf(kana)}
		>
			{badge && (
				<span className="absolute -top-2 rounded bg-primary px-1 font-sans text-[8px] text-primary-foreground">
					{badge}
				</span>
			)}
			{kana}
			<span
				className={romajiVariants({
					visibility: ROMAJI_ALWAYS_VISIBLE.has(state)
						? 'always'
						: 'onHover',
				})}
			>
				{romajiOf(kana)}
			</span>
		</button>
	);
}
