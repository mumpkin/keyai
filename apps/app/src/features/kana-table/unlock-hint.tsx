import { blockingKanaOf, nextKanaOf } from '@keyai/core/progression';
import { useTranslation } from 'react-i18next';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';

/** Says what stands between the learner and the next kana (C4). */
export function UnlockHint() {
	const { t: translate } = useTranslation();
	const progress = useProgress((state) => state.save.progress);
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const isRevision = useProgress(
		({ save }) =>
			save.settings.wordScript !== 'both' &&
			save.settings.trainingMode === 'words',
	);
	const { unlockOrder } = useVocabulary().file;
	const next = nextKanaOf(progress, unlockOrder);
	const blocking = blockingKanaOf(progress, threshold);
	if (isRevision) {
		return (
			<p className="h-5 truncate text-sm text-muted-foreground">
				{translate('kanaTable.revision')}
			</p>
		);
	}
	return (
		<p className="h-5 truncate text-sm text-muted-foreground">
			{next && blocking.length > 0 && (
				<>
					{translate('kanaTable.unlockHint', { next })}{' '}
					<span lang="ja" className="font-kana text-foreground">
						{blocking.join(' ')}
					</span>
				</>
			)}
		</p>
	);
}
