import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { useLayoutEffect, useRef } from 'react';
import type { WordView as WordViewModel } from './series-view.ts';
import { WordView } from './word-view.tsx';

const LINE_HEIGHT = 'calc(var(--kana-size) * 1.6)';
const VISIBLE_LINES = 3;

function useKeepCurrentLineCentered(currentIndex: number) {
	const viewportRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const currentWord = viewport?.querySelector<HTMLElement>(
			`[data-word-index="${currentIndex}"]`,
		);
		if (!(viewport && currentWord)) {
			return;
		}
		const lineHeight = viewport.clientHeight / VISIBLE_LINES;
		viewport.scrollTo({
			top: currentWord.offsetTop - lineHeight,
			behavior: 'smooth',
		});
	}, [currentIndex]);

	return viewportRef;
}

interface WordLineProps {
	readonly words: readonly WordViewModel[];
	readonly entries: readonly VocabEntry[];
	readonly currentIndex: number;
	readonly locale: Locale;
	readonly errorCount: number;
}

/** Three lines at most, scrolling with the current word (C8). */
export function WordLine({
	words,
	entries,
	currentIndex,
	locale,
	errorCount,
}: WordLineProps) {
	const viewportRef = useKeepCurrentLineCentered(currentIndex);
	return (
		<div
			ref={viewportRef}
			className="relative overflow-hidden"
			style={{
				fontSize: 'var(--kana-size)',
				lineHeight: LINE_HEIGHT,
				height: `calc(${LINE_HEIGHT} * ${VISIBLE_LINES})`,
			}}
		>
			<div className="flex flex-wrap gap-x-[0.5em]">
				{words.map((word) => (
					<WordView
						key={word.index}
						word={word}
						entry={entries[word.index]}
						locale={locale}
						errorCount={errorCount}
					/>
				))}
			</div>
		</div>
	);
}
