import { HistorySection } from '@/features/statistics/sections/history-section.tsx';
import { LastSeriesSection } from '@/features/statistics/sections/last-series-section.tsx';
import { ProgressSection } from '@/features/statistics/sections/progress-section.tsx';

export function StatisticsScreen() {
	return (
		<div className="flex flex-col gap-4">
			<LastSeriesSection />
			<ProgressSection />
			<HistorySection />
		</div>
	);
}
