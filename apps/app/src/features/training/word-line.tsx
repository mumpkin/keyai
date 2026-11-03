import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import { LastWordZone } from './last-word-zone';
import { WordView } from './word-view';

interface WordLineProps {
	readonly words: readonly SampleWord[];
}

function lastFinishedWord(
	words: readonly SampleWord[],
): SampleWord | undefined {
	return words.findLast(
		(word) => word.status === 'done' || word.status === 'skipped',
	);
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
			<LastWordZone word={lastFinishedWord(words)} />
		</div>
	);
}
