import { HistorySection } from './history-section.tsx';
import { LastSeriesSection } from './last-series-section.tsx';
import { ProgressSection } from './progress-section.tsx';

export function StatisticsScreen() {
	return (
		<div className="flex flex-col gap-4">
			<LastSeriesSection />
			<ProgressSection />
			<HistorySection />
		</div>
	);
}
