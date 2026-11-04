import { toHepburn, tokenize } from '@keyai/core/input';
import { useTranslation } from 'react-i18next';
import { GlossText } from '@/features/training/gloss-text.tsx';
import { glossOf } from '@/features/training/glosses.ts';
import { WordCard } from '@/features/training/word-card.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import type { SummaryWord } from './series-summary.ts';
import { EmptyNote, StatisticsBlock } from './statistics-section.tsx';

function WordRow({ word }: { readonly word: SummaryWord }) {
	const { t: translate } = useTranslation();
	const locale = useProgress((state) => state.save.settings.locale);
	const { entry, kanaPerMinute } = word;
	const [primary] = entry.word.senses;
	return (
		<li className="min-w-0">
			<WordCard entry={entry} locale={locale}>
				<span className="flex w-full items-baseline gap-2 py-0.5">
					<span className="shrink-0 font-kana whitespace-nowrap">
						{entry.word.kana}
					</span>
					<span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground">
						{toHepburn(tokenize(entry.word.kana))}
					</span>
					<span className="min-w-0 flex-1 truncate text-sm">
						{primary && (
							<GlossText gloss={glossOf(primary, locale)} />
						)}
					</span>
					{kanaPerMinute !== null && (
						<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
							{translate('common.speed', {
								value: Math.round(kanaPerMinute),
							})}
						</span>
					)}
				</span>
			</WordCard>
		</li>
	);
}

function WordList({
	title,
	emptyNote,
	words,
}: {
	readonly title: string;
	readonly emptyNote: string;
	readonly words: readonly SummaryWord[];
}) {
	return (
		<StatisticsBlock title={title}>
			{words.length > 0 ? (
				<ul className="max-h-60 scroll-y">
					{words.map((word) => (
						<WordRow key={word.position} word={word} />
					))}
				</ul>
			) : (
				<EmptyNote>{emptyNote}</EmptyNote>
			)}
		</StatisticsBlock>
	);
}

export function SeriesWordsLists({
	words,
}: {
	readonly words: readonly SummaryWord[];
}) {
	const { t: translate } = useTranslation();
	return (
		<>
			<WordList
				title={translate('statistics.words')}
				emptyNote={translate('statistics.noWords')}
				words={words.filter((word) => word.status === 'done')}
			/>
			<WordList
				title={translate('statistics.skippedWords')}
				emptyNote={translate('statistics.noSkippedWords')}
				words={words.filter((word) => word.status === 'skipped')}
			/>
		</>
	);
}
