import { cva } from 'class-variance-authority';
import type { SampleWord } from '@/features/blocking/sample-words';
import { WordCard } from './word-card';

type UnitState = 'typed' | 'partial' | 'next' | 'pending';

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

const unitVariants = cva('', {
	variants: {
		state: {
			typed: 'text-foreground',
			partial:
				'text-primary/60 underline decoration-2 underline-offset-4',
			next: 'underline decoration-primary decoration-2 underline-offset-4',
			pending: '',
		},
	},
});

function unitStateOf(word: SampleWord, unitIndex: number): UnitState {
	const completedUnits = word.completedUnits ?? 0;
	if (unitIndex < completedUnits) {
		return 'typed';
	}
	if (unitIndex > completedUnits) {
		return 'pending';
	}
	return word.hasPartialInput ? 'partial' : 'next';
}

interface UnitView {
	readonly id: string;
	readonly unit: string;
	readonly state: UnitState;
}

function unitViewsOf(word: SampleWord): UnitView[] {
	return [...word.kana].map((unit, unitIndex) => ({
		id: `${unitIndex}:${unit}`,
		unit,
		state: unitStateOf(word, unitIndex),
	}));
}

function CurrentWordUnits({ word }: { readonly word: SampleWord }) {
	return unitViewsOf(word).map(({ id, unit, state }) => (
		<span key={id} className={unitVariants({ state })}>
			{unit}
		</span>
	));
}

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
				{word.status === 'current' ? (
					<CurrentWordUnits word={word} />
				) : (
					word.kana
				)}
			</span>
			{isFinished && <WordCard word={word} />}
		</span>
	);
}
