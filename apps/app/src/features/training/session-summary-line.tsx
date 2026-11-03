import { Placeholder } from '@/features/blocking/placeholder';

export function SessionSummaryLine() {
	return (
		<Placeholder label="previous series" className="text-sm">
			<span className="hidden md:inline">Série précédente : </span>
			42 kana/min <span className="text-primary">▲3</span> · 94 % · 3
			erreurs · <button type="button">2 passés ›</button>
		</Placeholder>
	);
}
