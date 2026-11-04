import type { SessionRecord } from '@keyai/core/save';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { DataDetails } from './data-details.tsx';
import {
	EmptyNote,
	StatisticsBlock,
	StatisticsSection,
} from './statistics-section.tsx';
import { TrendChart } from './trend-chart.tsx';

const PERCENT = 100;
/** Points stay readable up to this many series. */
const MAXIMUM_SHOWN_POINTS = 20;
/** A line needs two points to show anything. */
const MINIMUM_SERIES = 2;

function useValueFormats() {
	const { t: translate } = useTranslation();
	const locale = useProgress((state) => state.save.settings.locale);
	const dateFormat = new Intl.DateTimeFormat(locale, {
		dateStyle: 'short',
		timeStyle: 'short',
	});
	return {
		date: (record: SessionRecord) =>
			dateFormat.format(new Date(record.date)),
		speed: (value: number) =>
			translate('common.speed', { value: Math.round(value) }),
		percent: (value: number) =>
			translate('common.percent', { value: Math.round(value) }),
	};
}

function HistoryTable({
	history,
}: {
	readonly history: readonly SessionRecord[];
}) {
	const { t: translate } = useTranslation();
	const format = useValueFormats();
	return (
		<DataDetails
			headers={[
				translate('statistics.date'),
				translate('statistics.speed'),
				translate('statistics.accuracy'),
				translate('statistics.wordCount'),
			]}
			rows={history.toReversed().map((record) => ({
				id: record.date,
				cells: [
					format.date(record),
					format.speed(record.kanaPerMinute),
					format.percent(record.accuracy * PERCENT),
					record.wordCount,
				],
			}))}
		/>
	);
}

function HistoryCharts({
	history,
}: {
	readonly history: readonly SessionRecord[];
}) {
	const { t: translate } = useTranslation();
	const format = useValueFormats();
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const pointsOf = (measure: (record: SessionRecord) => number) =>
		history.map((record, index) => ({
			position: index + 1,
			value: measure(record),
			title: format.date(record),
		}));
	const showsPoints = history.length <= MAXIMUM_SHOWN_POINTS;
	const speedLabel = translate('statistics.speedOverTime');
	const accuracyLabel = translate('statistics.accuracyOverTime');
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<StatisticsBlock title={speedLabel}>
				<TrendChart
					label={speedLabel}
					showsPoints={showsPoints}
					points={pointsOf((record) => record.kanaPerMinute)}
					formatValue={format.speed}
					threshold={{
						value: threshold,
						label: translate('statistics.threshold', {
							value: threshold,
						}),
					}}
				/>
			</StatisticsBlock>
			<StatisticsBlock title={accuracyLabel}>
				<TrendChart
					label={accuracyLabel}
					showsPoints={showsPoints}
					points={pointsOf((record) => record.accuracy * PERCENT)}
					formatValue={format.percent}
					maxValue={PERCENT}
				/>
			</StatisticsBlock>
		</div>
	);
}

export function HistorySection() {
	const { t: translate } = useTranslation();
	const history = useProgress((state) => state.save.history);
	return (
		<StatisticsSection title={translate('statistics.history')}>
			{history.length >= MINIMUM_SERIES ? (
				<>
					<HistoryCharts history={history} />
					<HistoryTable history={history} />
				</>
			) : (
				<EmptyNote>{translate('statistics.noHistory')}</EmptyNote>
			)}
		</StatisticsSection>
	);
}
