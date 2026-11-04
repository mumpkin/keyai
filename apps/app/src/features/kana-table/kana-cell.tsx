import { findKana } from '@keyai/core/kana';
import { cva } from 'class-variance-authority';
import {
	type KanaDisplayState,
	masteryColorOf,
	masteryTextColorOf,
} from './kana-states.ts';

const cellVariants = cva(
	'group relative flex size-11 flex-col items-center justify-center rounded-md border font-kana text-lg focus-visible:outline-2',
	{
		variants: {
			state: {
				locked: 'border-transparent text-muted-foreground/30',
				learning: 'border-border',
				mastered: 'border-border',
				latest: 'border-primary ring-2 ring-primary',
				next: 'border-2 border-dashed border-primary/60 text-muted-foreground',
			},
		},
	},
);

const romajiVariants = cva('font-sans text-[10px]', {
	variants: {
		isColoured: {
			true: '',
			false: 'text-muted-foreground',
		},
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
	/** Mastery from 0 to 1. */
	readonly score: number;
}

const PERCENT = 100;
const COLOURED_STATES = new Set<KanaDisplayState>([
	'learning',
	'mastered',
	'latest',
]);

function titleOf(kana: string, state: KanaDisplayState, score: number) {
	const romaji = romajiOf(kana);
	return COLOURED_STATES.has(state)
		? `${romaji} · ${Math.round(score * PERCENT)} %`
		: romaji;
}

export function KanaCell({ kana, state, score }: KanaCellProps) {
	if (!kana) {
		return <span className="size-11" />;
	}
	const badge = STATE_BADGES[state];
	const isColoured = COLOURED_STATES.has(state);
	return (
		<button
			type="button"
			className={cellVariants({ state })}
			title={titleOf(kana, state, score)}
			style={
				isColoured
					? {
							backgroundColor: masteryColorOf(score),
							color: masteryTextColorOf(score),
						}
					: undefined
			}
		>
			{badge && (
				<span className="absolute -top-2 rounded bg-primary px-1 font-sans text-[8px] text-primary-foreground">
					{badge}
				</span>
			)}
			{kana}
			<span
				className={romajiVariants({
					isColoured,
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
