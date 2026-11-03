import { cva } from 'class-variance-authority';
import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import { KanaUnits } from './kana-units';
import { WordCard } from './word-card';

const entryVariants = cva(
	'group relative flex w-full items-baseline gap-2 rounded-md px-2 py-1 focus-visible:outline-2',
	{
		variants: {
			isLatest: {
				true: 'bg-primary/10',
				false: '',
			},
			isSkipped: {
				true: 'text-muted-foreground',
				false: '',
			},
		},
	},
);

function finishedWordsNewestFirst(words: readonly SampleWord[]): SampleWord[] {
	return words
		.filter((word) => word.status === 'done' || word.status === 'skipped')
		.reverse();
}

function RecapEntry({
	word,
	isLatest,
}: {
	readonly word: SampleWord;
	readonly isLatest: boolean;
}) {
	const isSkipped = word.status === 'skipped';
	return (
		<li>
			<button
				type="button"
				className={entryVariants({ isLatest, isSkipped })}
			>
				<span
					className={
						isSkipped ? 'font-kana line-through' : 'font-kana'
					}
				>
					<KanaUnits word={word} />
				</span>
				<span className="font-mono text-xs text-muted-foreground">
					{word.romaji}
				</span>
				<span className="truncate text-sm">
					{isSkipped ? `passé · ${word.gloss}` : word.gloss}
				</span>
				<WordCard word={word} />
			</button>
		</li>
	);
}

interface SeriesWordsRecapProps {
	readonly words: readonly SampleWord[];
}

export function SeriesWordsRecap({ words }: SeriesWordsRecapProps) {
	const finishedWords = finishedWordsNewestFirst(words);

	return (
		<Placeholder label="series words">
			<ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
				{finishedWords.map((word, position) => (
					<RecapEntry
						key={word.id}
						word={word}
						isLatest={position === 0}
					/>
				))}
			</ul>
		</Placeholder>
	);
}
