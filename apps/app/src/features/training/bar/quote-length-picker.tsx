import { QUOTE_LENGTHS, type QuoteLength } from '@keyai/core/quote';
import { withQuote } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { useProgress } from '@/stores/app-context.tsx';
import { lengthButtonClass } from './series-length-picker.tsx';

export function QuoteLengthPicker({
	onChange,
}: {
	readonly onChange: () => void;
}) {
	const { t: translate } = useTranslation();
	const length = useProgress((state) => state.save.settings.quote.length);
	const updateSettings = useProgress((state) => state.updateSettings);

	function choose(choice: QuoteLength) {
		updateSettings((settings) => withQuote(settings, { length: choice }));
		onChange();
	}

	return (
		<fieldset
			aria-label={translate('training.quote.length')}
			className="flex h-6 items-center gap-1 text-xs pointer-coarse:h-8"
			data-keeps-focus
		>
			{QUOTE_LENGTHS.map((choice) => (
				<button
					key={choice}
					type="button"
					aria-pressed={choice === length}
					onClick={() => choose(choice)}
					className={lengthButtonClass(choice === length)}
				>
					{translate(`training.quote.${choice}`)}
				</button>
			))}
		</fieldset>
	);
}
