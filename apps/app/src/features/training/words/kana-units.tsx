import { cva } from 'class-variance-authority';
import type { UnitView } from '@/features/training/series/series-view.ts';

export const unitVariants = cva('', {
	variants: {
		state: {
			typed: 'text-typed-foreground',
			faulty: 'text-destructive',
			partial: 'text-primary',
			next: '',
			pending: '',
		},
	},
});

export function isUnderCursor({ state }: Pick<UnitView, 'state'>): boolean {
	return state === 'next' || state === 'partial';
}

export function KanaUnits({ units }: { readonly units: readonly UnitView[] }) {
	return units.map((unit) => (
		<span
			key={unit.id}
			className={unitVariants({ state: unit.state })}
			data-cursor={isUnderCursor(unit) || undefined}
		>
			{unit.kana}
		</span>
	));
}
