import type { KanaSpeed } from '@keyai/core/stats';
import { useTranslation } from 'react-i18next';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from 'recharts';
import { masteryColorOf } from '@/features/kana-table/kana-states.ts';
import { StatisticsBlock } from '@/features/statistics/sections/statistics-section.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import {
	AXIS_TICK,
	AXIS_WIDTH_PX,
	CHART_HEIGHT_PX,
	ChartTooltipBox,
	roundAxisMax,
	thresholdLineOf,
} from './chart-parts.tsx';
import { DataDetails } from './data-details.tsx';

const PERCENT = 100;
const SHOWN_KANA = 15;
const MAXIMUM_BAR_WIDTH_PX = 28;
const BAR_RADIUS_PX = 4;
const KANA_TICK = {
	fontSize: 14,
	fill: 'var(--foreground)',
	fontFamily: 'var(--font-kana)',
};

function useKanaFormats() {
	const { t: translate } = useTranslation();
	return {
		speed: (kana: KanaSpeed) =>
			translate('common.speed', {
				value: Math.round(kana.kanaPerMinute),
			}),
		accuracy: (kana: KanaSpeed) =>
			translate('common.percent', {
				value: Math.round(kana.accuracy * PERCENT),
			}),
	};
}

function KanaTooltip({
	active,
	payload,
}: Partial<TooltipContentProps<number, string>>) {
	const { t: translate } = useTranslation();
	const format = useKanaFormats();
	const kana = payload?.[0]?.payload as KanaSpeed | undefined;
	if (!(active && kana)) {
		return null;
	}
	const accuracy = translate('statistics.accuracyOf', {
		value: format.accuracy(kana),
	});
	return (
		<ChartTooltipBox
			value={format.speed(kana)}
			title={
				<>
					<span lang="ja" className="font-kana">
						{kana.kana}
					</span>{' '}
					· {accuracy}
				</>
			}
		/>
	);
}

function ChartLegend() {
	const { t: translate } = useTranslation();
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	return (
		<p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
			{translate('statistics.accuracy')}
			<span>{translate('common.percent', { value: 0 })}</span>
			<span
				className="h-2 w-24 rounded-sm"
				style={{
					backgroundImage: `linear-gradient(to right in oklch, var(--mastery-low), var(--mastery-high))`,
				}}
			/>
			<span>{translate('common.percent', { value: PERCENT })}</span>
			<span className="ml-2 w-5 border-t-2 border-dashed border-muted-foreground" />
			{translate('statistics.threshold', { value: threshold })}
		</p>
	);
}

function KanaBars({
	kanaSpeeds,
}: {
	readonly kanaSpeeds: readonly KanaSpeed[];
}) {
	const { t: translate } = useTranslation();
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	return (
		<div role="img" aria-label={translate('statistics.slowestKana')}>
			<ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
				<BarChart data={kanaSpeeds.slice(0, SHOWN_KANA)}>
					<CartesianGrid vertical={false} stroke="var(--border)" />
					<XAxis
						dataKey="kana"
						interval={0}
						tick={KANA_TICK}
						tickLine={false}
						stroke="var(--border)"
					/>
					<YAxis
						width={AXIS_WIDTH_PX}
						domain={[
							0,
							(dataMax: number) =>
								roundAxisMax(Math.max(dataMax, threshold)),
						]}
						tick={AXIS_TICK}
						tickLine={false}
						axisLine={false}
					/>
					<Tooltip
						cursor={{ fill: 'var(--muted)' }}
						isAnimationActive={false}
						content={<KanaTooltip />}
					/>
					<Bar
						dataKey="kanaPerMinute"
						maxBarSize={MAXIMUM_BAR_WIDTH_PX}
						radius={[BAR_RADIUS_PX, BAR_RADIUS_PX, 0, 0]}
						isAnimationActive={false}
					>
						{kanaSpeeds.slice(0, SHOWN_KANA).map((kana) => (
							<Cell
								key={kana.kana}
								fill={masteryColorOf(kana.accuracy)}
							/>
						))}
					</Bar>
					{thresholdLineOf({ value: threshold })}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

/** What slows the series down, even without any error (C3). */
export function KanaSpeedChart({
	kanaSpeeds,
}: {
	readonly kanaSpeeds: readonly KanaSpeed[];
}) {
	const { t: translate } = useTranslation();
	const format = useKanaFormats();
	return (
		<StatisticsBlock title={translate('statistics.slowestKana')}>
			<KanaBars kanaSpeeds={kanaSpeeds} />
			<ChartLegend />
			<DataDetails
				headers={[
					translate('statistics.kana'),
					translate('statistics.speed'),
					translate('statistics.accuracy'),
				]}
				rows={kanaSpeeds.map((kana) => ({
					id: kana.kana,
					cells: [
						<span key="kana" lang="ja" className="font-kana">
							{kana.kana}
						</span>,
						format.speed(kana),
						format.accuracy(kana),
					],
				}))}
			/>
		</StatisticsBlock>
	);
}
