import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import { SeriesWordsRecap } from './series-words-recap';
import { WordView } from './word-view';

interface WordLineProps {
	readonly words: readonly SampleWord[];
}

export function WordLine({ words }: WordLineProps) {
	return (
		<div className="flex flex-col gap-4">
			<Placeholder label="word line">
				<div className="flex flex-wrap items-baseline gap-x-[0.5em] gap-y-2">
					{words.map((word) => (
						<WordView key={word.kana} word={word} />
					))}
				</div>
			</Placeholder>
			<SeriesWordsRecap words={words} />
		</div>
	);
}
