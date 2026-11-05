import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { WordView as WordViewModel } from '@/features/training/series/series-view.ts';
import { WordCard } from '@/features/word-card/word-card.tsx';
import { cn } from '@/lib/utils.ts';
import { KanaUnits } from './kana-units.tsx';

const wordVariants = cva('font-kana', {
	variants: {
		status: {
			done: 'text-typed-foreground',
			skipped: 'text-muted-foreground line-through',
			current: 'text-pending-foreground',
			pending: 'text-pending-foreground',
		},
	},
});

interface WordViewProps {
	readonly word: WordViewModel;
	readonly entry: VocabEntry | undefined;
	readonly locale: Locale;
	/** Changes on every wrong key to replay the shake animation. */
	readonly errorCount: number;
	/** What to show instead of the kana: the kanji of a quote. */
	readonly writing?: ReactNode;
}

export function WordView({
	word,
	entry,
	locale,
	errorCount,
	writing,
}: WordViewProps) {
	const isFinished = word.status === 'done' || word.status === 'skipped';
	const shakes = word.status === 'current' && errorCount > 0;
	const kana = (
		<span
			lang="ja"
			key={shakes ? errorCount : undefined}
			className={cn(
				wordVariants({ status: word.status }),
				shakes && 'inline-block animate-shake',
			)}
		>
			{writing ?? <KanaUnits units={word.units} />}
		</span>
	);
	return (
		<span className="inline-block" data-word-index={word.index}>
			{isFinished && entry ? (
				<WordCard entry={entry} locale={locale}>
					{kana}
				</WordCard>
			) : (
				kana
			)}
		</span>
	);
}
