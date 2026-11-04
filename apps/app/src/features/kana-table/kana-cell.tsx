import { findKana } from '@keyai/core/kana';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { type KanaDisplayState, masteryColorsOf } from './kana-states.ts';

const cellVariants = cva(
	'group relative flex size-11 flex-col items-center justify-center rounded-md border font-kana text-lg focus-visible:outline-2',
	{
		variants: {
			state: {
				locked: 'border-transparent text-muted-foreground/50',
				learning: 'border-2 border-dashed',
				mastered: 'border-2 border-dashed',
				latest: 'border-2 border-dashed ring-2 ring-primary',
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

const STATE_BADGES = {
	latest: 'kanaTable.latest',
	next: 'kanaTable.next',
} as const;

function badgeOf(state: KanaDisplayState) {
	return state === 'latest' || state === 'next'
		? STATE_BADGES[state]
		: undefined;
}

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

export function KanaCell({ kana, state, score }: KanaCellProps) {
	const { t: translate } = useTranslation();
	if (!kana) {
		return <span className="size-11" />;
	}
	const badge = badgeOf(state);
	const isColoured = COLOURED_STATES.has(state);
	const romaji = romajiOf(kana);
	const mastery = translate('common.percent', {
		value: Math.round(score * PERCENT),
	});
	return (
		<button
			type="button"
			className={cellVariants({ state })}
			title={isColoured ? `${romaji} · ${mastery}` : romaji}
			style={isColoured ? masteryColorsOf(score) : undefined}
		>
			{badge && (
				<span className="absolute -top-2 rounded bg-primary px-1 font-sans text-[8px] text-primary-foreground">
					{translate(badge)}
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
				{romaji}
			</span>
		</button>
	);
}
