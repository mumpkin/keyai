import { useLayoutEffect, useRef } from 'react';
import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';
import { SeriesWordsRecap } from './series-words-recap';
import { WordView } from './word-view';

const LINE_HEIGHT = 'calc(var(--kana-size) * 1.6)';
const VISIBLE_LINES = 3;

function useKeepCurrentLineCentered(words: readonly SampleWord[]) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const currentWordId = words.find((word) => word.status === 'current')?.id;

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const currentWord = viewport?.querySelector<HTMLElement>(
			`[data-word-id="${currentWordId}"]`,
		);
		if (!(viewport && currentWord)) {
			return;
		}
		const lineHeight = viewport.clientHeight / VISIBLE_LINES;
		viewport.scrollTo({
			top: currentWord.offsetTop - lineHeight,
			behavior: 'smooth',
		});
	}, [currentWordId]);

	return viewportRef;
}

interface WordLineProps {
	readonly words: readonly SampleWord[];
}

export function WordLine({ words }: WordLineProps) {
	const viewportRef = useKeepCurrentLineCentered(words);

	return (
		<div className="flex flex-col gap-4">
			<Placeholder label="word line">
				<div
					ref={viewportRef}
					className="relative overflow-hidden"
					style={{
						lineHeight: LINE_HEIGHT,
						height: `calc(${LINE_HEIGHT} * ${VISIBLE_LINES})`,
					}}
				>
					<div className="flex flex-wrap gap-x-[0.5em]">
						{words.map((word) => (
							<WordView key={word.id} word={word} />
						))}
					</div>
				</div>
			</Placeholder>
			<SeriesWordsRecap words={words} />
		</div>
	);
}
