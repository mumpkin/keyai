import type { FaultyKana } from '@keyai/core/stats';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { KanaSpeedChart } from './kana-speed-chart.tsx';
import type { SeriesSummary } from './series-summary.ts';
import { SeriesWordsLists } from './series-words-lists.tsx';
import {
	EmptyNote,
	StatisticsBlock,
	StatisticsSection,
	StatTile,
} from './statistics-section.tsx';
import { TrendChart } from './trend-chart.tsx';

const PERCENT = 100;

function FaultyKanaList({
	faultyKana,
}: {
	readonly faultyKana: readonly FaultyKana[];
}) {
	const { t: translate } = useTranslation();
	return (
		<StatisticsBlock title={translate('statistics.faultyKana')}>
			{faultyKana.length > 0 ? (
				<ul className="flex flex-wrap gap-2">
					{faultyKana.map(({ kana, faultyAttempts }) => (
						<li
							key={kana}
							className="flex items-baseline gap-1 rounded-md bg-muted/50 px-2 py-1"
						>
							<span className="font-kana text-lg">{kana}</span>
							<span className="text-xs text-muted-foreground">
								×{faultyAttempts}
							</span>
						</li>
					))}
				</ul>
			) : (
				<EmptyNote>{translate('statistics.noFaultyKana')}</EmptyNote>
			)}
		</StatisticsBlock>
	);
}

function SpeedPerWordChart({ summary }: { readonly summary: SeriesSummary }) {
	const { t: translate } = useTranslation();
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const label = translate('statistics.speedPerWord');
	return (
		<StatisticsBlock title={label}>
			<TrendChart
				label={label}
				showsPoints
				points={summary.words.map((word) => ({
					position: word.position,
					value: word.kanaPerMinute,
					title: (
						<span className="font-kana">
							{word.entry.word.kana}
						</span>
					),
				}))}
				formatValue={(value) =>
					translate('common.speed', { value: Math.round(value) })
				}
				threshold={{
					value: threshold,
					label: translate('statistics.threshold', {
						value: threshold,
					}),
				}}
			/>
		</StatisticsBlock>
	);
}

function SeriesFigures({ summary }: { readonly summary: SeriesSummary }) {
	const { t: translate } = useTranslation();
	const { measurements, unlockedKana, words } = summary;
	return (
		<>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
				<StatTile
					label={translate('statistics.speed')}
					value={translate('common.speed', {
						value: Math.round(measurements.kanaPerMinute),
					})}
				/>
				<StatTile
					label={translate('statistics.accuracy')}
					value={translate('common.percent', {
						value: Math.round(measurements.accuracy * PERCENT),
					})}
				/>
				<StatTile
					label={translate('statistics.errors')}
					value={String(measurements.errorCount)}
				/>
				<StatTile
					label={translate('statistics.wordCount')}
					value={String(words.length)}
				/>
			</div>
			{unlockedKana && (
				<p className="text-sm">
					✦ {translate('training.unlocked')}{' '}
					<span className="font-kana">{unlockedKana}</span>
				</p>
			)}
		</>
	);
}

export function LastSeriesSection() {
	const { t: translate } = useTranslation();
	const summary = useUiStore((state) => state.lastSeries);
	return (
		<StatisticsSection title={translate('statistics.lastSeries')}>
			{summary ? (
				<>
					<SeriesFigures summary={summary} />
					<SpeedPerWordChart summary={summary} />
					<KanaSpeedChart kanaSpeeds={summary.kanaSpeeds} />
					<div className="grid gap-4 md:grid-cols-3">
						<FaultyKanaList
							faultyKana={summary.measurements.faultyKana}
						/>
						<SeriesWordsLists words={summary.words} />
					</div>
				</>
			) : (
				<EmptyNote>{translate('statistics.noLastSeries')}</EmptyNote>
			)}
		</StatisticsSection>
	);
}
