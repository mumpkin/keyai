import type { SessionRecord } from '@keyai/core/save';
import type { InputMode } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { DataDetails } from '@/features/statistics/charts/data-details.tsx';
import { TrendChart } from '@/features/statistics/charts/trend-chart.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import {
	EmptyNote,
	StatisticsBlock,
	StatisticsSection,
} from './statistics-section.tsx';

const PERCENT = 100;
/** Points stay readable up to this many series. */
const MAXIMUM_SHOWN_POINTS = 20;
/** A line needs two points to show anything. */
const MINIMUM_SERIES = 2;

/** Typed and spoken series are measured apart (C9). */
const LABELS = {
	keyboard: {
		title: 'statistics.history',
		speed: 'statistics.speed',
		accuracy: 'statistics.accuracy',
		speedOverTime: 'statistics.speedOverTime',
		accuracyOverTime: 'statistics.accuracyOverTime',
	},
	voice: {
		title: 'statistics.spokenHistory',
		speed: 'statistics.readingSpeed',
		accuracy: 'statistics.firstTry',
		speedOverTime: 'statistics.readingSpeedOverTime',
		accuracyOverTime: 'statistics.firstTryOverTime',
	},
} as const;

type Labels = (typeof LABELS)[InputMode];

function inputOf(record: SessionRecord): InputMode {
	return record.input ?? 'keyboard';
}

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
	labels,
}: {
	readonly history: readonly SessionRecord[];
	readonly labels: Labels;
}) {
	const { t: translate } = useTranslation();
	const format = useValueFormats();
	return (
		<DataDetails
			headers={[
				translate('statistics.date'),
				translate(labels.speed),
				translate(labels.accuracy),
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
	labels,
	showsThreshold,
}: {
	readonly history: readonly SessionRecord[];
	readonly labels: Labels;
	/** The reading speed has no threshold yet. */
	readonly showsThreshold: boolean;
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
	const speedLabel = translate(labels.speedOverTime);
	const accuracyLabel = translate(labels.accuracyOverTime);
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<StatisticsBlock title={speedLabel}>
				<TrendChart
					label={speedLabel}
					showsPoints={showsPoints}
					points={pointsOf((record) => record.kanaPerMinute)}
					formatValue={format.speed}
					{...(showsThreshold && {
						threshold: {
							value: threshold,
							label: translate('statistics.threshold', {
								value: threshold,
							}),
						},
					})}
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

/** The series typed, or those read aloud, which only show once there are some. */
export function HistorySection({ input }: { readonly input: InputMode }) {
	const { t: translate } = useTranslation();
	const allHistory = useProgress((state) => state.save.history);
	const history = allHistory.filter((record) => inputOf(record) === input);
	const labels = LABELS[input];
	if (input === 'voice' && history.length === 0) {
		return null;
	}
	return (
		<StatisticsSection title={translate(labels.title)}>
			{history.length >= MINIMUM_SERIES ? (
				<>
					<HistoryCharts
						history={history}
						labels={labels}
						showsThreshold={input === 'keyboard'}
					/>
					<HistoryTable history={history} labels={labels} />
				</>
			) : (
				<EmptyNote>{translate('statistics.noHistory')}</EmptyNote>
			)}
		</StatisticsSection>
	);
}
