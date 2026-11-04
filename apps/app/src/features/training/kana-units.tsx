import { cva } from 'class-variance-authority';
import type { UnitView } from './series-view.ts';

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

export function KanaUnits({ units }: { readonly units: readonly UnitView[] }) {
	return units.map((unit) => (
		<span key={unit.id} className={unitVariants({ state: unit.state })}>
			{unit.kana}
		</span>
	));
}
