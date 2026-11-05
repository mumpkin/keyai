import { WORDS_PER_SESSION_LIMITS } from '@keyai/core/settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { cn } from '@/lib/utils.ts';

// biome-ignore lint/style/noMagicNumbers: the presets are the values themselves
const SERIES_LENGTH_PRESETS: readonly number[] = [10, 20, 50, 100];

export function lengthButtonClass(isSelected: boolean) {
	return cn(
		'inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 pointer-coarse:h-8 pointer-coarse:min-w-8',
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

/** A fixed slot: the field and the button take the same room. */
function CustomLength({
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
	);
}

export function SeriesLengthPicker(props: SeriesLengthPickerProps) {
	const { length, onChange } = props;
	return (
		<span
			className="flex h-6 items-center gap-1 text-xs pointer-coarse:h-8"
			data-keeps-focus
		>
			{SERIES_LENGTH_PRESETS.map((preset) => (
				<button
					key={preset}
					type="button"
					aria-pressed={preset === length}
					onClick={() => onChange(preset)}
					className={lengthButtonClass(preset === length)}
				>
					{preset}
				</button>
			))}
			<CustomLength {...props} />
		</span>
	);
}
