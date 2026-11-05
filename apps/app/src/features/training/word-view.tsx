import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils.ts';
import { KanaUnits } from './kana-units.tsx';
import type { WordView as WordViewModel } from './series-view.ts';
import { WordCard } from './word-card.tsx';

const wordVariants = cva('font-kana', {
	variants: {
		status: {
			done: 'text-foreground',
			skipped: 'text-muted-foreground line-through',
			current: 'text-muted-foreground',
			pending: 'text-muted-foreground',
		},
	},
});

interface WordViewProps {
	readonly word: WordViewModel;
	readonly entry: VocabEntry | undefined;
	readonly locale: Locale;
	/** Changes on every wrong key to replay the shake animation. */
	readonly errorCount: number;
}

export function WordView({ word, entry, locale, errorCount }: WordViewProps) {
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
			<KanaUnits units={word.units} />
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
