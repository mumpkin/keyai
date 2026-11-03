import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import type { TranslationLayout } from './translation-layout';
import { type WordGloss, WordView } from './word-view';

interface WordLineProps {
	readonly words: readonly SampleWord[];
	readonly layout: TranslationLayout;
}

function lastFinishedIndex(words: readonly SampleWord[]): number {
	return words.findLastIndex((word) => word.status === 'done');
}

function glossFor(
	words: readonly SampleWord[],
	index: number,
	layout: TranslationLayout,
): WordGloss | undefined {
	const word = words[index];
	if (word?.status !== 'done') {
		return undefined;
	}
	if (layout === 'everyWord') {
		return { text: word.gloss, overflows: false };
	}
	if (layout === 'lastWord' && index === lastFinishedIndex(words)) {
		return { text: `↳ ${word.gloss}`, overflows: true };
	}
	return undefined;
}

function TranslationZone({ words }: { readonly words: readonly SampleWord[] }) {
	const lastWord = words[lastFinishedIndex(words)];
	return (
		<Placeholder label="translation zone" className="min-h-12">
			{lastWord && (
				<p>
					<span className="font-kana">{lastWord.kana}</span> —{' '}
					{lastWord.gloss}
				</p>
			)}
		</Placeholder>
	);
}

export function WordLine({ words, layout }: WordLineProps) {
	return (
		<div className="flex flex-col gap-4">
			<Placeholder label="word line">
				<div className="flex flex-wrap items-start gap-x-3 gap-y-3 md:gap-y-6">
					{words.map((word, index) => (
						<WordView
							key={word.kana}
							word={word}
							gloss={glossFor(words, index, layout)}
						/>
					))}
				</div>
			</Placeholder>
			{layout === 'zone' && <TranslationZone words={words} />}
		</div>
	);
}
