import { toHepburn, tokenize } from '@keyai/core/input';
import type { SeriesState } from '@keyai/core/session';
import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';
import { GlossText } from './gloss-text.tsx';
import { glossOf } from './glosses.ts';
import { KanaUnits } from './kana-units.tsx';
import { recapWordIndexes, type WordView } from './series-view.ts';
import { WordCard } from './word-card.tsx';

interface RecapEntryProps {
	readonly word: WordView;
	readonly entry: VocabEntry;
	readonly locale: Locale;
	readonly isLatest: boolean;
}

function RecapEntry({ word, entry, locale, isLatest }: RecapEntryProps) {
	const { t: translate } = useTranslation();
	const isSkipped = word.status === 'skipped';
	const [primary] = entry.word.senses;
	return (
		<li>
			<WordCard entry={entry} locale={locale}>
				<span
					className={cn(
						'flex w-full items-baseline gap-2 rounded-md px-2 py-1',
						isLatest && 'bg-primary/10',
						isSkipped && 'text-muted-foreground',
					)}
				>
					<span
						className={cn('font-kana', isSkipped && 'line-through')}
					>
						<KanaUnits units={word.units} />
					</span>
					<span className="font-mono text-xs text-muted-foreground">
						{toHepburn(tokenize(entry.word.kana))}
					</span>
					<span className="truncate text-sm">
						{isSkipped && `${translate('training.skipped')} · `}
						{primary && (
							<GlossText gloss={glossOf(primary, locale)} />
						)}
					</span>
				</span>
			</WordCard>
		</li>
	);
}

interface SeriesWordsRecapProps {
	readonly series: SeriesState;
	readonly words: readonly WordView[];
	readonly entries: readonly VocabEntry[];
	readonly locale: Locale;
}

/** Each finished word of the series once, the most recent first (C8). */
export function SeriesWordsRecap({
	series,
	words,
	entries,
	locale,
}: SeriesWordsRecapProps) {
	const indexes = recapWordIndexes(series);
	return (
		<ul className="grid max-h-[4.75rem] min-h-[4.75rem] gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">
			{indexes.map((index, position) => {
				const word = words[index];
				const entry = entries[index];
				return word && entry ? (
					<RecapEntry
						key={index}
						word={word}
						entry={entry}
						locale={locale}
						isLatest={position === 0}
					/>
				) : null;
			})}
		</ul>
	);
}
