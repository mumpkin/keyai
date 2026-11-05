import type { Locale } from '@keyai/core/settings';
import type { VocabEntry } from '@keyai/core/vocab';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import type { WordView as WordViewModel } from '@/features/training/series/series-view.ts';
import { cn } from '@/lib/utils.ts';
import { WordView } from './word-view.tsx';

const LINE_SCALE = 1.6;
const VISIBLE_LINES = 3;

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
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
		if (cursor) {
			// A finished quote stays on screen, with nothing left to type.
			cursor.hidden = !unit;
		}
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

interface TypingLineProps {
	readonly currentIndex: number;
	/** Natural writing: nothing separates the words (C8). */
	readonly isJoined: boolean;
	/** Height of a line in kana sizes: furigana need more room. */
	readonly lineScale?: number;
	readonly children: ReactNode;
}

/** Three lines at most, scrolling with the current word (C8). */
export function TypingLine({
	currentIndex,
	isJoined,
	lineScale = LINE_SCALE,
	children,
}: TypingLineProps) {
	const lineHeight = `calc(var(--kana-size) * ${lineScale})`;
	const viewportRef = useKeepCurrentLineCentered(currentIndex);
	const { contentRef, cursorRef } = useGlidingCursor();
	return (
		<div
			ref={viewportRef}
			className="relative overflow-hidden"
			style={{
				fontSize: 'var(--kana-size)',
				lineHeight,
				height: `calc(${lineHeight} * ${VISIBLE_LINES})`,
			}}
		>
			<div
				ref={contentRef}
				className={cn(
					'relative flex flex-wrap',
					!isJoined && 'gap-x-[0.5em]',
				)}
			>
				<span
					ref={cursorRef}
					aria-hidden="true"
					data-typing-cursor
					className="pointer-events-none absolute top-0 left-0 h-0.5 bg-primary transition-[transform,width] duration-100 ease-out motion-reduce:transition-none"
				/>
				{children}
			</div>
		</div>
	);
}

interface WordLineProps {
	readonly words: readonly WordViewModel[];
	readonly entries: readonly VocabEntry[];
	readonly currentIndex: number;
	readonly locale: Locale;
	readonly errorCount: number;
	readonly isJoined: boolean;
}

export function WordLine({
	words,
	entries,
	currentIndex,
	locale,
	errorCount,
	isJoined,
}: WordLineProps) {
	return (
		<TypingLine currentIndex={currentIndex} isJoined={isJoined}>
			{words.map((word) => (
				<WordView
					key={word.index}
					word={word}
					entry={entries[word.index]}
					locale={locale}
					errorCount={errorCount}
				/>
			))}
		</TypingLine>
	);
}
