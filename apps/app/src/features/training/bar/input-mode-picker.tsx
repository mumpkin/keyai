import { INPUT_MODES, withInputMode } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { lengthButtonClass } from './series-length-picker.tsx';

const LABELS = {
	keyboard: 'training.input.keyboard',
	voice: 'training.input.voice',
} as const;

/** Typing, or reading the words aloud into the microphone (C9). */
export function InputModePicker() {
	const { t: translate } = useTranslation();
	const mode = useProgress((state) => state.save.settings.inputMode);
	const updateSettings = useProgress((state) => state.updateSettings);
	return (
		<fieldset
			aria-label={translate('training.input.label')}
			className="flex h-6 items-center gap-1 text-xs pointer-coarse:h-8"
			data-keeps-focus
		>
			{INPUT_MODES.map((choice) => (
				<button
					key={choice}
					type="button"
					aria-pressed={choice === mode}
					onClick={() =>
						updateSettings((settings) =>
							withInputMode(settings, choice),
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
