import {
	QUOTE_DISPLAYS,
	type QuoteDisplay,
	withQuote,
} from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { lengthButtonClass } from './series-length-picker.tsx';

/** Changes the writing at once; the kana to type stay the same. */
export function QuoteDisplayPicker({
	onChange,
}: {
	readonly onChange: () => void;
}) {
	const { t: translate } = useTranslation();
	const display = useProgress((state) => state.save.settings.quote.display);
	const updateSettings = useProgress((state) => state.updateSettings);

	function choose(choice: QuoteDisplay) {
		updateSettings((settings) => withQuote(settings, { display: choice }));
		onChange();
	}

	return (
		<fieldset
			aria-label={translate('training.quote.display')}
			className="flex h-6 items-center gap-1 text-xs pointer-coarse:h-8"
			data-keeps-focus
		>
			{QUOTE_DISPLAYS.map((choice) => (
				<button
					key={choice}
					type="button"
					aria-pressed={choice === display}
					onClick={() => choose(choice)}
					className={lengthButtonClass(choice === display)}
				>
					{translate(`training.quote.${choice}`)}
				</button>
			))}
		</fieldset>
	);
}
