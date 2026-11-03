import { cva } from 'class-variance-authority';
import type { SampleWord } from '@/features/blocking/sample-words';
import { KanaUnits } from './kana-units';
import { WordCard } from './word-card';

const wordVariants = cva('font-kana leading-tight', {
	variants: {
		status: {
			done: 'text-foreground',
			skipped: 'text-muted-foreground/60 line-through',
			current: 'text-muted-foreground',
			pending: 'text-muted-foreground',
		},
	},
});

interface WordViewProps {
	readonly word: SampleWord;
}

export function WordView({ word }: WordViewProps) {
	const isFinished = word.status === 'done' || word.status === 'skipped';

	return (
		<span
			className="group relative inline-block"
			tabIndex={isFinished ? 0 : undefined}
		>
			<span
				className={wordVariants({ status: word.status })}
				style={{ fontSize: 'var(--kana-size)' }}
			>
				<KanaUnits word={word} />
			</span>
			{isFinished && <WordCard word={word} />}
		</span>
	);
}
