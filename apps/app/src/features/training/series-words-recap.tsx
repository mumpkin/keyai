import { toHepburn, tokenize } from '@keyai/core/input';
import type { SeriesState } from '@keyai/core/session';
import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';
import { GlossText } from './gloss-text.tsx';
import { glossOf } from './glosses.ts';
import { KanaUnits } from './kana-units.tsx';
import { recapWordIndexes, type WordView } from './series-view.ts';
import { useRowWheelScroll } from './use-row-wheel-scroll.ts';
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
		<li className="min-w-0">
			<WordCard entry={entry} locale={locale}>
				<span
					className={cn(
						'flex w-full items-baseline gap-2 rounded-md px-2 py-1',
						isLatest && 'bg-primary/10',
						isSkipped && 'text-muted-foreground',
					)}
				>
					<span
						className={cn(
							'shrink-0 font-kana whitespace-nowrap',
							isSkipped && 'line-through',
						)}
					>
						<KanaUnits units={word.units} />
					</span>
					<span className="min-w-0 shrink truncate font-mono text-xs text-muted-foreground">
						{toHepburn(tokenize(entry.word.kana))}
					</span>
					<span className="min-w-0 flex-1 truncate text-sm">
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
	const listRef = useRef<HTMLUListElement>(null);
	useRowWheelScroll(listRef);
	const indexes = recapWordIndexes(series);
	const latestIndex = indexes[0];

	// The newest word comes first: it must be seen as soon as it is finished.
	useLayoutEffect(() => {
		if (latestIndex !== undefined) {
			listRef.current?.scrollTo({ top: 0 });
		}
	}, [latestIndex]);

	return (
		<ul
			ref={listRef}
			className="grid h-[4.25rem] scroll-y grid-cols-1 gap-1 [overflow-anchor:none] sm:grid-cols-2 lg:grid-cols-4"
		>
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
