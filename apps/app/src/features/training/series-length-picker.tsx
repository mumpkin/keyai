import { WORDS_PER_SESSION_LIMITS } from '@keyai/core/settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { cn } from '@/lib/utils';

// biome-ignore lint/style/noMagicNumbers: the presets are the values themselves
export const SERIES_LENGTH_PRESETS: readonly number[] = [10, 20, 50, 100];

function lengthButtonClass(isSelected: boolean) {
	return cn(
		'rounded px-1.5 py-0.5',
		isSelected
			? 'bg-primary text-primary-foreground'
			: 'text-muted-foreground hover:text-foreground',
	);
}

interface SeriesLengthPickerProps {
	readonly length: number;
	readonly onChange: (length: number) => void;
	/** Called when the custom field closes without changing the length. */
	readonly onDismiss: () => void;
}

export function SeriesLengthPicker({
	length,
	onChange,
	onDismiss,
}: SeriesLengthPickerProps) {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const isCustom = !SERIES_LENGTH_PRESETS.includes(length);

	function dismiss() {
		setIsEditing(false);
		onDismiss();
	}

	function commit(customLength: number) {
		if (customLength === length) {
			dismiss();
		} else {
			setIsEditing(false);
			onChange(customLength);
		}
	}

	return (
		<span className="flex h-6 items-center gap-1 text-xs" data-keeps-focus>
			{SERIES_LENGTH_PRESETS.map((preset) => (
				<button
					key={preset}
					type="button"
					onClick={() => onChange(preset)}
					className={lengthButtonClass(preset === length)}
				>
					{preset}
				</button>
			))}
			{/* A fixed slot: the field and the button take the same room. */}
			<span className="flex w-18 justify-end">
				{isEditing ? (
					<NumberField
						label={translate('settings.session.wordsPerSeries')}
						value={length}
						limits={WORDS_PER_SESSION_LIMITS}
						onCommit={commit}
						onCancel={dismiss}
						opensFocused
						className="h-6! w-full! px-1.5 text-xs md:text-xs"
					/>
				) : (
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						className={lengthButtonClass(isCustom)}
					>
						{translate('training.customLength')}
						{isCustom && ` · ${length}`}
					</button>
				)}
			</span>
		</span>
	);
}
