import { cva } from 'class-variance-authority';
import type { SampleWord } from '@/features/blocking/sample-words';

type UnitState = 'typed' | 'faulty' | 'partial' | 'next' | 'pending';

const unitVariants = cva('', {
	variants: {
		state: {
			typed: 'text-foreground',
			faulty: 'text-destructive',
			partial:
				'text-primary/60 underline decoration-2 underline-offset-4',
			next: 'underline decoration-primary decoration-2 underline-offset-4',
			pending: '',
		},
	},
});

function currentUnitState(word: SampleWord, unitIndex: number): UnitState {
	const completedUnits = word.completedUnits ?? 0;
	if (unitIndex > completedUnits) {
		return 'pending';
	}
	if (unitIndex === completedUnits) {
		return word.hasPartialInput ? 'partial' : 'next';
	}
	return 'typed';
}

function unitStateOf(word: SampleWord, unitIndex: number): UnitState {
	if (word.faultyUnits?.includes(unitIndex)) {
		return 'faulty';
	}
	if (word.status === 'current') {
		return currentUnitState(word, unitIndex);
	}
	return word.status === 'done' ? 'typed' : 'pending';
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

interface KanaUnitsProps {
	readonly word: SampleWord;
}

export function KanaUnits({ word }: KanaUnitsProps) {
	return unitViewsOf(word).map(({ id, unit, state }) => (
		<span key={id} className={unitVariants({ state })}>
			{unit}
		</span>
	));
}
