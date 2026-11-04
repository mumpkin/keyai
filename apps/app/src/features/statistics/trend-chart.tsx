import type { ReactNode } from 'react';
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from 'recharts';
import {
	AXIS_TICK,
	AXIS_WIDTH_PX,
	CHART_HEIGHT_PX,
	type ChartThreshold,
	ChartTooltipBox,
	roundAxisMax,
	thresholdLineOf,
} from './chart-parts.tsx';

const POINT_RADIUS_PX = 4;

export interface TrendPoint {
	/** Position on the horizontal axis. */
	readonly position: number;
	readonly value: number | null;
	/** What the point is, shown in the tooltip. */
	readonly title: ReactNode;
}

interface TrendChartProps {
	readonly label: string;
	readonly points: readonly TrendPoint[];
	readonly formatValue: (value: number) => string;
	readonly threshold?: ChartThreshold;
	readonly maxValue?: number;
	readonly showsPoints?: boolean;
}

function TrendTooltip({
	active,
	payload,
	formatValue,
}: Partial<TooltipContentProps<number, string>> & {
	readonly formatValue: TrendChartProps['formatValue'];
}) {
	const point = payload?.[0]?.payload as TrendPoint | undefined;
	if (!(active && point) || point.value === null) {
		return null;
	}
	return (
		<ChartTooltipBox value={formatValue(point.value)} title={point.title} />
	);
}

/** One measure over positions: a single line, with an optional target. */
export function TrendChart({
	label,
	points,
	formatValue,
	threshold,
	maxValue,
	showsPoints = false,
}: TrendChartProps) {
	const highest = (dataMax: number) =>
		maxValue ?? roundAxisMax(Math.max(dataMax, threshold?.value ?? 0));
	const dot = showsPoints
		? { r: POINT_RADIUS_PX, fill: 'var(--primary)', strokeWidth: 0 }
		: false;
	return (
		<div role="img" aria-label={label}>
			<ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
				<LineChart data={[...points]}>
					<CartesianGrid vertical={false} stroke="var(--border)" />
					<XAxis
						dataKey="position"
						tick={AXIS_TICK}
						tickLine={false}
						stroke="var(--border)"
						minTickGap={24}
					/>
					<YAxis
						width={AXIS_WIDTH_PX}
						domain={[0, highest]}
						tick={AXIS_TICK}
						tickLine={false}
						axisLine={false}
					/>
					<Tooltip
						cursor={{ stroke: 'var(--muted-foreground)' }}
						isAnimationActive={false}
						content={<TrendTooltip formatValue={formatValue} />}
					/>
					{threshold && thresholdLineOf(threshold)}
					<Line
						dataKey="value"
						stroke="var(--primary)"
						strokeWidth={2}
						dot={dot}
						activeDot={{ r: POINT_RADIUS_PX + 1 }}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
