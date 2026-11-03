import { cva } from 'class-variance-authority';
import type { SampleWord } from '@/features/blocking/sample-words';
import { WordCard } from './word-card';

const kanaVariants = cva('font-kana text-4xl leading-tight', {
	variants: {
		status: {
			done: 'text-foreground',
			skipped: 'text-muted-foreground line-through',
			current: 'rounded bg-primary/10 text-foreground',
			pending: 'text-muted-foreground',
		},
	},
});

export interface WordGloss {
	readonly text: string;
	readonly overflows: boolean;
}

interface WordViewProps {
	readonly word: SampleWord;
	readonly gloss?: WordGloss | undefined;
}

const glossVariants = cva('text-xs text-primary', {
	variants: {
		overflows: {
			true: 'absolute top-full left-0 whitespace-nowrap',
			false: 'w-0 min-w-full truncate text-center',
		},
	},
});

function typedRomajiOf(word: SampleWord): string {
	if (word.status === 'current') {
		return `${word.typed ?? ''}▌`;
	}
	return word.status === 'pending' ? '' : word.romaji;
}

export function WordView({ word, gloss }: WordViewProps) {
	const isFinished = word.status === 'done' || word.status === 'skipped';

	return (
		<span
			className="group relative inline-flex flex-col items-center"
			tabIndex={isFinished ? 0 : undefined}
		>
			<span className={kanaVariants({ status: word.status })}>
				{word.kana}
			</span>
			<span className="h-5 font-mono text-sm text-muted-foreground">
				{typedRomajiOf(word)}
			</span>
			{gloss && (
				<span className={glossVariants({ overflows: gloss.overflows })}>
					{gloss.text}
				</span>
			)}
			{isFinished && <WordCard word={word} />}
		</span>
	);
}
