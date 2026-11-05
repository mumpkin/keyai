import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';

/** Adds a word to the list to export, or takes it out (C8). */
export function AnkiToggle({ wordId }: { readonly wordId: string }) {
	const { t: translate } = useTranslation();
	const isListed = useProgress((state) =>
		state.save.ankiWords.includes(wordId),
	);
	const updateAnkiWords = useProgress((state) => state.updateAnkiWords);

	function toggle() {
		updateAnkiWords((words) =>
			isListed
				? words.filter((word) => word !== wordId)
				: [...words, wordId],
		);
	}

	return (
		<button
			type="button"
			onClick={toggle}
			className="w-fit text-primary underline"
		>
			{translate(isListed ? 'wordCard.ankiRemove' : 'wordCard.ankiAdd')}
		</button>
	);
}
