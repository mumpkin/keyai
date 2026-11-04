import { useTranslation } from 'react-i18next';
import { KanaTable } from '@/features/kana-table/kana-table.tsx';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';
import {
	masteryBreakdownOf,
	type ScriptBreakdown,
} from './mastery-breakdown.ts';
import { StatisticsSection } from './statistics-section.tsx';

/** Checked with the palette validator against both theme surfaces. */
const SEGMENT_COLOURS = {
	mastered: 'var(--mastery-high)',
	learning: 'var(--mastery-low)',
	locked: 'var(--muted)',
} as const;

const STATES = ['mastered', 'learning', 'locked'] as const;

function ScriptBar({ breakdown }: { readonly breakdown: ScriptBreakdown }) {
	const { t: translate } = useTranslation();
	return (
		<div className="flex flex-col gap-1">
			<p className="text-sm font-medium capitalize">{breakdown.script}</p>
			<div className="flex h-3 gap-0.5">
				{STATES.filter((state) => breakdown[state] > 0).map((state) => (
					<span
						key={state}
						className="rounded-sm"
						style={{
							flexGrow: breakdown[state],
							backgroundColor: SEGMENT_COLOURS[state],
						}}
					/>
				))}
			</div>
			<ul className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
				{STATES.map((state) => (
					<li key={state} className="flex items-center gap-1">
						<span
							className="size-2 rounded-sm border"
							style={{ backgroundColor: SEGMENT_COLOURS[state] }}
						/>
						<span className="text-foreground tabular-nums">
							{breakdown[state]}
						</span>
						{translate(`statistics.${state}`)}
					</li>
				))}
			</ul>
		</div>
	);
}

export function ProgressSection() {
	const { t: translate } = useTranslation();
	const progress = useProgress((state) => state.save.progress);
	const thresholdKanaPerMinute = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const { unlockOrder } = useVocabulary().file;
	const breakdowns = masteryBreakdownOf(progress, {
		unlockOrder,
		thresholdKanaPerMinute,
	});
	return (
		<StatisticsSection title={translate('statistics.progress')}>
			<div className="grid gap-4 md:grid-cols-2">
				{breakdowns.map((breakdown) => (
					<ScriptBar key={breakdown.script} breakdown={breakdown} />
				))}
			</div>
			<KanaTable />
		</StatisticsSection>
	);
}
