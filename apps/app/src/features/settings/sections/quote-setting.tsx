import { QUOTE_HINT_LIMITS, withQuote } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import {
	SettingRow,
	SettingSection,
} from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

function QuoteSwitch({
	label,
	checked,
	onChange,
}: {
	readonly label: string;
	readonly checked: boolean;
	readonly onChange: (checked: boolean) => void;
}) {
	return (
		<SettingRow label={label}>
			<Switch
				aria-label={label}
				checked={checked}
				onCheckedChange={onChange}
			/>
		</SettingRow>
	);
}

/** How quotes are shown and typed; their writing level sits in the bar. */
export function QuoteSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const { quote } = settings;
	const update = (change: Parameters<typeof withQuote>[1]) =>
		updateSettings((current) => withQuote(current, change));
	const hintLabel = translate('settings.quote.hint');
	return (
		<SettingSection title={translate('settings.quote.title')}>
			<SettingRow label={hintLabel}>
				<NumberField
					label={hintLabel}
					value={quote.hintAfterErrors}
					limits={QUOTE_HINT_LIMITS}
					onCommit={(hintAfterErrors) => update({ hintAfterErrors })}
				/>
			</SettingRow>
			<QuoteSwitch
				label={translate('settings.quote.punctuation')}
				checked={quote.typesPunctuation}
				onChange={(typesPunctuation) => update({ typesPunctuation })}
			/>
			<QuoteSwitch
				label={translate('settings.quote.spaces')}
				checked={quote.keepsSpaces}
				onChange={(keepsSpaces) => update({ keepsSpaces })}
			/>
		</SettingSection>
	);
}
