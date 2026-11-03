import {
	TRANSLATION_LAYOUTS,
	type TranslationLayout,
} from './translation-layout';

interface TranslationLayoutSwitchProps {
	readonly layout: TranslationLayout;
	readonly onChange: (layout: TranslationLayout) => void;
}

export function TranslationLayoutSwitch({
	layout,
	onChange,
}: TranslationLayoutSwitchProps) {
	return (
		<fieldset className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-500 bg-amber-500/10 p-2 text-xs">
			<legend className="px-1 font-mono text-amber-700 dark:text-amber-400">
				BLOCKING — affichage de la traduction
			</legend>
			{(Object.keys(TRANSLATION_LAYOUTS) as TranslationLayout[]).map(
				(option) => (
					<label key={option} className="flex items-center gap-1">
						<input
							type="radio"
							name="translation-layout"
							checked={option === layout}
							onChange={() => onChange(option)}
						/>
						{TRANSLATION_LAYOUTS[option]}
					</label>
				),
			)}
		</fieldset>
	);
}
