import {
	type BlockingOptions,
	KANA_SIZE_LABELS,
	ROMAJI_DISPLAY_LABELS,
	TRANSLATION_LAYOUT_LABELS,
} from './blocking-options';
import { OptionGroup } from './option-group';

interface BlockingControlsProps {
	readonly options: BlockingOptions;
	readonly onChange: (options: BlockingOptions) => void;
}

export function BlockingControls({ options, onChange }: BlockingControlsProps) {
	return (
		<fieldset className="flex flex-col gap-1 rounded-lg border border-dashed border-amber-500 bg-amber-500/10 p-2 text-xs">
			<legend className="px-1 font-mono text-amber-700 dark:text-amber-400">
				BLOCKING — variantes à comparer
			</legend>
			<OptionGroup
				name="translation-layout"
				legend="Traduction :"
				labels={TRANSLATION_LAYOUT_LABELS}
				value={options.translationLayout}
				onChange={(translationLayout) =>
					onChange({ ...options, translationLayout })
				}
			/>
			<OptionGroup
				name="romaji-display"
				legend="Romaji sous les mots :"
				labels={ROMAJI_DISPLAY_LABELS}
				value={options.romajiDisplay}
				onChange={(romajiDisplay) =>
					onChange({ ...options, romajiDisplay })
				}
			/>
			<OptionGroup
				name="kana-size"
				legend="Taille des kana :"
				labels={KANA_SIZE_LABELS}
				value={options.kanaSize}
				onChange={(kanaSize) => onChange({ ...options, kanaSize })}
			/>
		</fieldset>
	);
}
