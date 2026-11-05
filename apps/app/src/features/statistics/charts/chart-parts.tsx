import type { ReactNode } from 'react';
import { ReferenceLine } from 'recharts';

export const CHART_HEIGHT_PX = 180;
export const AXIS_WIDTH_PX = 36;
export const AXIS_TICK = { fontSize: 12, fill: 'var(--muted-foreground)' };

const HEADROOM = 1.1;
const DECIMAL_BASE = 10;
const STEPS_PER_MAGNITUDE = 2;

export interface ChartThreshold {
	readonly value: number;
	/** Left out when bars would cover it: the legend then gives the value. */
	readonly label?: string;
}

/** Rounds up to a value that reads well on an axis: 1277 becomes 1500. */
export function roundAxisMax(value: number): number {
	const wanted = Math.max(value * HEADROOM, 1);
	const magnitude =
		DECIMAL_BASE ** Math.floor(Math.log10(wanted)) / STEPS_PER_MAGNITUDE;
	return Math.ceil(wanted / magnitude) * magnitude;
}

function labelOf(text: string) {
	return {
		value: text,
		position: 'insideBottomRight',
		fontSize: 12,
		fill: 'var(--muted-foreground)',
	} as const;
}

/** A plain function: Recharts reads the children of its chart. */
export function thresholdLineOf(threshold: ChartThreshold) {
	return (
		<ReferenceLine
			y={threshold.value}
			stroke="var(--muted-foreground)"
			strokeDasharray="4 4"
			{...(threshold.label ? { label: labelOf(threshold.label) } : {})}
		/>
	);
}

export function ChartTooltipBox({
	value,
	title,
}: {
	readonly value: string;
	readonly title: ReactNode;
}) {
	return (
		<div className="rounded-md border bg-popover px-2 py-1 text-sm text-popover-foreground shadow-md">
			<p className="font-medium">{value}</p>
			<p className="text-xs text-muted-foreground">{title}</p>
		</div>
	);
}
