import { useTranslation } from 'react-i18next';
import { Placeholder } from '@/features/blocking/placeholder';

function LastSeriesSection() {
	const { t: translate } = useTranslation();
	const keyFigures = [
		translate('common.speed', { value: 42 }),
		translate('common.percent', { value: 94 }),
		translate('training.errors', { count: 3 }),
		translate('statistics.words', { count: 20 }),
	];
	return (
		<Placeholder label="last series" className="flex flex-col gap-3">
			<h2 className="text-lg font-semibold">
				{translate('statistics.lastSeries')}
			</h2>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
				{keyFigures.map((figure) => (
					<Placeholder
						key={figure}
						label="figure"
						className="text-2xl"
					>
						{figure}
					</Placeholder>
				))}
			</div>
			<Placeholder
				label="chart · speed per word + threshold"
				className="h-40"
			/>
			<div className="grid gap-2 md:grid-cols-3">
				<Placeholder label="faulty kana" className="h-24" />
				<Placeholder label="words encountered" className="h-24" />
				<Placeholder label="skipped words" className="h-24" />
			</div>
		</Placeholder>
	);
}

export function StatisticsScreen() {
	const { t: translate } = useTranslation();
	return (
		<div className="flex flex-col gap-4">
			<LastSeriesSection />
			<Placeholder label="progress" className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">
					{translate('statistics.progress')}
				</h2>
				<Placeholder
					label="chart · hiragana / katakana mastery"
					className="h-20"
				/>
				<Placeholder
					label="kana table coloured by mastery"
					className="h-48"
				/>
			</Placeholder>
			<Placeholder label="history" className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">
					{translate('statistics.history')}
				</h2>
				<Placeholder
					label="chart · speed and accuracy, last 100 series"
					className="h-48"
				/>
			</Placeholder>
		</div>
	);
}
