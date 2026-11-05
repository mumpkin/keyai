import { TRAINING_MODES, withTrainingMode } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { lengthButtonClass } from './series-length-picker.tsx';

const LABELS = {
	words: 'training.quote.words',
	quotes: 'training.quote.quotes',
} as const;

export function TrainingModePicker() {
	const { t: translate } = useTranslation();
	const mode = useProgress((state) => state.save.settings.trainingMode);
	const updateSettings = useProgress((state) => state.updateSettings);
	return (
		<fieldset
			aria-label={translate('training.quote.mode')}
			className="flex h-6 items-center gap-1 text-xs pointer-coarse:h-8"
			data-keeps-focus
		>
			{TRAINING_MODES.map((choice) => (
				<button
					key={choice}
					type="button"
					aria-pressed={choice === mode}
					onClick={() =>
						updateSettings((settings) =>
							withTrainingMode(settings, choice),
						)
					}
					className={lengthButtonClass(choice === mode)}
				>
					{translate(LABELS[choice])}
				</button>
			))}
		</fieldset>
	);
}
