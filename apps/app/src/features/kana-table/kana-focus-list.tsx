import { useTranslation } from 'react-i18next';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';
import { KanaCell } from './kana-cell.tsx';
import { focusKanaOf, kanaStatesOf } from './kana-states.ts';

/**
 * The kana table of a phone: the whole chart does not fit and most of it is
 * of no use, so it only shows what is being learned, and the next kana.
 */
export function KanaFocusList() {
	const { t: translate } = useTranslation();
	const progress = useProgress((state) => state.save.progress);
	const thresholdKanaPerMinute = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const { unlockOrder, initialUnlocked } = useVocabulary().file;
	const context = {
		progress,
		unlockOrder,
		initialUnlocked,
		thresholdKanaPerMinute,
	};
	const states = kanaStatesOf(context);
	const kana = focusKanaOf(context);
	const label = translate('kanaTable.focusTitle');
	return (
		<div className="flex flex-col gap-1" data-keeps-focus>
			<p className="flex justify-between text-sm">
				<span className="font-medium">{label}</span>
				<span className="text-muted-foreground">
					{translate('kanaTable.masteredCount', {
						count: progress.unlocked.length - kana.learningCount,
					})}
				</span>
			</p>
			<ul
				aria-label={label}
				className="flex flex-wrap gap-x-2 gap-y-3 pt-2"
			>
				{kana.list.map((item) => (
					<li key={item}>
						<KanaCell
							kana={item}
							state={states.stateOf(item)}
							score={states.scoreOf(item)}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
