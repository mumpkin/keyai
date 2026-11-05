import { cva } from 'class-variance-authority';
import type { UnitView } from '@/features/training/series/series-view.ts';

const unitVariants = cva('', {
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

function isUnderCursor(unit: UnitView): boolean {
	return unit.state === 'next' || unit.state === 'partial';
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
