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

/**
 * One cursor for the whole line, placed under the unit being typed: moving
 * it, rather than underlining each unit, lets it glide between kana (C8).
 */
function useGlidingCursor() {
	const contentRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<HTMLSpanElement>(null);

	useLayoutEffect(() => {
		const content = contentRef.current;
		const cursor = cursorRef.current;
		const unit = content?.querySelector('[data-cursor]');
		if (!(content && cursor && unit)) {
			return;
		}
		const origin = content.getBoundingClientRect();
		const target = unit.getBoundingClientRect();
		const left = target.left - origin.left;
		const top = target.bottom - origin.top;
		cursor.style.transform = `translate(${left}px, ${top}px)`;
		cursor.style.width = `${target.width}px`;
	});

	return { contentRef, cursorRef };
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
	const { contentRef, cursorRef } = useGlidingCursor();
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
			<div
				ref={contentRef}
				className="relative flex flex-wrap gap-x-[0.5em]"
			>
				<span
					ref={cursorRef}
					aria-hidden="true"
					className="pointer-events-none absolute top-0 left-0 h-0.5 bg-primary transition-[transform,width] duration-100 ease-out motion-reduce:transition-none"
				/>
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
