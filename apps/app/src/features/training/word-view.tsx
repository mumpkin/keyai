import { cva } from 'class-variance-authority';
import type {
	KanaSize,
	RomajiDisplay,
} from '@/features/blocking/blocking-options';
import type { SampleWord } from '@/features/blocking/sample-words';
import { WordCard } from './word-card';

const kanaVariants = cva('font-kana leading-tight', {
	variants: {
		status: {
			done: 'text-foreground',
			skipped: 'text-muted-foreground line-through',
			current: 'rounded bg-primary/10 text-foreground',
			pending: 'text-muted-foreground',
		},
		size: {
			small: 'text-2xl',
			medium: 'text-3xl',
			large: 'text-4xl',
		},
	},
});

interface WordViewProps {
	readonly word: SampleWord;
	readonly showGloss: boolean;
	readonly romajiDisplay: RomajiDisplay;
	readonly kanaSize: KanaSize;
}

function romajiOf(word: SampleWord, romajiDisplay: RomajiDisplay): string {
	if (word.status === 'current') {
		return romajiDisplay === 'hidden' ? '▌' : `${word.typed ?? ''}▌`;
	}
	if (word.status === 'skipped') {
		return word.romaji;
	}
	const showsFinishedRomaji =
		romajiDisplay === 'always' && word.status === 'done';
	return showsFinishedRomaji ? word.romaji : '';
}

const GLOSS_CLASSES =
	'w-0 min-w-full truncate text-center text-primary text-xs leading-5';

function Gloss({ word }: { readonly word: SampleWord }) {
	return <span className={GLOSS_CLASSES}>{word.gloss}</span>;
}

export function WordView({
	word,
	showGloss,
	romajiDisplay,
	kanaSize,
}: WordViewProps) {
	const isFinished = word.status === 'done' || word.status === 'skipped';
	const hasGloss = showGloss && word.status === 'done';
	const glossTakesRomajiRow = hasGloss && romajiDisplay !== 'always';

	return (
		<span
			className="group relative inline-flex flex-col items-center"
			tabIndex={isFinished ? 0 : undefined}
		>
			<span
				className={kanaVariants({
					status: word.status,
					size: kanaSize,
				})}
			>
				{word.kana}
			</span>
			{glossTakesRomajiRow ? (
				<Gloss word={word} />
			) : (
				<span className="h-5 font-mono text-sm text-muted-foreground">
					{romajiOf(word, romajiDisplay)}
				</span>
			)}
			{hasGloss && !glossTakesRomajiRow && <Gloss word={word} />}
			{isFinished && <WordCard word={word} />}
		</span>
	);
}
