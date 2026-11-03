import type { BlockingOptions } from '@/features/blocking/blocking-options';
import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import { LastWordZone } from './last-word-zone';
import { WordView } from './word-view';

interface WordLineProps {
	readonly words: readonly SampleWord[];
	readonly options: BlockingOptions;
}

function lastFinishedWord(
	words: readonly SampleWord[],
): SampleWord | undefined {
	return words.findLast((word) => word.status === 'done');
}

export function WordLine({ words, options }: WordLineProps) {
	const usesZone = options.translationLayout === 'zone';

	return (
		<div className="flex flex-col gap-4">
			<Placeholder label="word line">
				<div className="flex flex-wrap items-start gap-x-3 gap-y-3 md:gap-y-5">
					{words.map((word) => (
						<WordView
							key={word.kana}
							word={word}
							showGloss={!usesZone}
							romajiDisplay={options.romajiDisplay}
							kanaSize={options.kanaSize}
						/>
					))}
				</div>
			</Placeholder>
			{usesZone && <LastWordZone word={lastFinishedWord(words)} />}
		</div>
	);
}
